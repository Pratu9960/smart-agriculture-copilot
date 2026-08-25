import os
import json
import socket
import struct
import base64

class SimpleWebSocket:
    def __init__(self, ws_url):
        url_clean = ws_url.replace('ws://', '')
        host_port, path = url_clean.split('/', 1)
        path = '/' + path
        if ':' in host_port:
            host, port = host_port.split(':')
            port = int(port)
        else:
            host = host_port
            port = 80

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.settimeout(10.0)
        self.sock.connect((host, port))

        key = base64.b64encode(os.urandom(16)).decode('utf-8')
        req = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode('utf-8'))
        
        # Read HTTP response headers until \r\n\r\n
        header_data = bytearray()
        while b'\r\n\r\n' not in header_data:
            chunk = self.sock.recv(1024)
            if not chunk:
                break
            header_data.extend(chunk)
            
        resp = header_data.decode('utf-8', errors='ignore')
        if " 101 " not in resp and "101" not in resp:
            raise Exception(f"WebSocket handshake failed: {resp}")
        self.msg_id = 1

    def _recv_exact(self, n):
        data = bytearray()
        while len(data) < n:
            chunk = self.sock.recv(n - len(data))
            if not chunk:
                raise EOFError("Socket closed while reading data")
            data.extend(chunk)
        return data

    def send(self, method, params=None):
        mid = self.msg_id
        self.msg_id += 1
        payload = json.dumps({"id": mid, "method": method, "params": params or {}}).encode('utf-8')
        
        length = len(payload)
        frame = bytearray([0x81]) # FIN + text opcode
        mask_key = os.urandom(4)
        
        if length < 126:
            frame.append(0x80 | length)
        elif length < 65536:
            frame.append(0x80 | 126)
            frame.extend(struct.pack('>H', length))
        else:
            frame.append(0x80 | 127)
            frame.extend(struct.pack('>Q', length))
            
        frame.extend(mask_key)
        masked_payload = bytearray(length)
        for i in range(length):
            masked_payload[i] = payload[i] ^ mask_key[i % 4]
        frame.extend(masked_payload)
        self.sock.sendall(frame)
        return mid

    def recv(self, target_id=None):
        while True:
            head = self._recv_exact(2)
            b1, b2 = head[0], head[1]
            opcode = b1 & 0x0F
            is_masked = bool(b2 & 0x80)
            length = b2 & 0x7F
            
            if length == 126:
                length = struct.unpack('>H', self._recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack('>Q', self._recv_exact(8))[0]

            mask_key = None
            if is_masked:
                mask_key = self._recv_exact(4)

            payload = self._recv_exact(length)
            if is_masked and mask_key:
                unmasked = bytearray(length)
                for i in range(length):
                    unmasked[i] = payload[i] ^ mask_key[i % 4]
                payload = unmasked

            if opcode == 0x01: # text frame
                msg = json.loads(payload.decode('utf-8'))
                if target_id is None or msg.get('id') == target_id:
                    return msg
                # If it's an event (no id or different id), ignore and continue reading
            elif opcode == 0x08: # close
                return None

    def call(self, method, params=None):
        mid = self.send(method, params)
        while True:
            res = self.recv(mid)
            if res and res.get('id') == mid:
                if 'error' in res:
                    raise Exception(f"CDP error calling {method}: {res['error']}")
                return res.get('result', {})

    def close(self):
        try:
            self.sock.close()
        except:
            pass

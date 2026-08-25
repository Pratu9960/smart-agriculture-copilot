import re
import subprocess
import json

# New keys to add to each language's weather and schemes dictionaries
weather_additions = {
    'en': {
        'searchBtn': 'Search',
        'condClearSky': 'Clear sky',
        'condMainlyClear': 'Mainly clear',
        'condPartlyCloudy': 'Partly cloudy',
        'condOvercast': 'Overcast',
        'condFoggy': 'Foggy',
        'condRimeFog': 'Dense fog',
        'condLightDrizzle': 'Light drizzle',
        'condDrizzle': 'Drizzle',
        'condHeavyDrizzle': 'Heavy drizzle',
        'condLightRain': 'Light rain',
        'condRain': 'Rain',
        'condHeavyRain': 'Heavy rain',
        'condLightSnow': 'Light snow',
        'condSnow': 'Snow',
        'condHeavySnow': 'Heavy snow',
        'condRainShowers': 'Rain showers',
        'condHeavyRainShowers': 'Heavy rain showers',
        'condThunderstorm': 'Thunderstorm',
        'condThunderstormHail': 'Thunderstorm with hail',
        'condSevereThunderstorm': 'Severe thunderstorm',
        'advisoryRainLikelyHeadline': 'Rain is likely',
        'advisoryRainLikelyDetail': 'Rainfall is currently occurring or has a high probability. Consider delaying irrigation to avoid unnecessary water use.',
        'advisoryRainLikelyRec': '💧 Recommendation: Avoid irrigation for the next few hours.',
        'advisoryHotDryHeadline': 'Hot and dry conditions',
        'advisoryHotDryDetail': 'High temperature and relatively low humidity may increase crop water demand. Check soil moisture and irrigate if required.',
        'advisoryHotDryRec': '💧 Recommendation: Irrigate soon if soil moisture is low.',
        'advisoryModerateHeadline': 'Moderate water demand',
        'advisoryModerateDetail': 'Warm conditions may increase water demand. Check soil moisture before irrigation.',
        'advisoryModerateRec': '💧 Recommendation: Check soil moisture before irrigating.',
        'advisoryNormalHeadline': 'Normal irrigation conditions',
        'advisoryNormalDetail': 'No strong weather signal indicates immediate irrigation. Check actual soil moisture and crop needs before watering.',
        'advisoryNormalRec': '💧 Recommendation: Follow routine irrigation schedule.'
    },
    'mr': {
        'searchBtn': 'शोधा',
        'condClearSky': 'निरभ्र आकाश',
        'condMainlyClear': 'मुख्यतः निरभ्र',
        'condPartlyCloudy': 'अंशतः ढगाळ',
        'condOvercast': 'ढगाळ',
        'condFoggy': 'धुके',
        'condRimeFog': 'दाट धुके',
        'condLightDrizzle': 'हलकी रिमझिम',
        'condDrizzle': 'रिमझिम पाऊस',
        'condHeavyDrizzle': 'जोरदार रिमझिम',
        'condLightRain': 'हलका पाऊस',
        'condRain': 'पाऊस',
        'condHeavyRain': 'मुसळधार पाऊस',
        'condLightSnow': 'हलकी बर्फवृष्टी',
        'condSnow': 'बर्फवृष्टी',
        'condHeavySnow': 'जोरदार बर्फवृष्टी',
        'condRainShowers': 'पावसाच्या सरी',
        'condHeavyRainShowers': 'जोरदार पावसाच्या सरी',
        'condThunderstorm': 'वादळी पाऊस',
        'condThunderstormHail': 'गारपिटीसह वादळी पाऊस',
        'condSevereThunderstorm': 'तीव्र वादळी पाऊस',
        'advisoryRainLikelyHeadline': 'पावसाची शक्यता आहे',
        'advisoryRainLikelyDetail': 'सध्या पाऊस पडत आहे किंवा पावसाची दाट शक्यता आहे. पाण्याचा अपव्यय टाळण्यासाठी सिंचन पुढे ढकला.',
        'advisoryRainLikelyRec': '💧 शिफारस: पुढील काही तास सिंचन टाळा.',
        'advisoryHotDryHeadline': 'उष्ण आणि कोरडे हवामान',
        'advisoryHotDryDetail': 'जास्त तापमान आणि कमी आर्द्रतेमुळे पिकांची पाण्याची गरज वाढू शकते. जमिनीतील ओलावा तपासा आणि गरज असल्यास पाणी द्या.',
        'advisoryHotDryRec': '💧 शिफारस: मातीत ओलावा कमी असल्यास लवकर सिंचन करा.',
        'advisoryModerateHeadline': 'मध्यम पाण्याची गरज',
        'advisoryModerateDetail': 'उष्ण वातावरणामुळे पाण्याची गरज वाढू शकते. सिंचनापूर्वी मातीतील ओलावा तपासा.',
        'advisoryModerateRec': '💧 शिफारस: सिंचनापूर्वी मातीतील ओलावा तपासा.',
        'advisoryNormalHeadline': 'सामान्य सिंचन परिस्थिती',
        'advisoryNormalDetail': 'हवामानानुसार तातडीने सिंचनाची गरज दिसत नाही. पाणी देण्यापूर्वी जमिनीतील ओलावा आणि पिकाची गरज तपासा.',
        'advisoryNormalRec': '💧 शिफारस: नियमित सिंचन वेळापत्रकाचे पालन करा.'
    },
    'hi': {
        'searchBtn': 'खोजें',
        'condClearSky': 'साफ आसमान',
        'condMainlyClear': 'मुख्य रूप से साफ',
        'condPartlyCloudy': 'आंशिक रूप से बादल',
        'condOvercast': 'बादलों से घिरा',
        'condFoggy': 'कोहरा',
        'condRimeFog': 'घना कोहरा',
        'condLightDrizzle': 'हल्की बूंदाबांदी',
        'condDrizzle': 'बूंदाबांदी',
        'condHeavyDrizzle': 'तेज बूंदाबांदी',
        'condLightRain': 'हल्की बारिश',
        'condRain': 'बारिश',
        'condHeavyRain': 'भारी बारिश',
        'condLightSnow': 'हल्की बर्फबारी',
        'condSnow': 'बर्फबारी',
        'condHeavySnow': 'भारी बर्फबारी',
        'condRainShowers': 'बारिश की फुहारें',
        'condHeavyRainShowers': 'तेज बारिश की फुहारें',
        'condThunderstorm': 'गरज के साथ तूफान',
        'condThunderstormHail': 'ओलावृष्टि के साथ तूफान',
        'condSevereThunderstorm': 'भीषण आंधी-तूफान',
        'advisoryRainLikelyHeadline': 'बारिश की संभावना है',
        'advisoryRainLikelyDetail': 'वर्तमान में बारिश हो रही है या इसकी अधिक संभावना है। पानी के अनावश्यक उपयोग से बचने के लिए सिंचाई टालें।',
        'advisoryRainLikelyRec': '💧 सिफारिश: अगले कुछ घंटों के लिए सिंचाई से बचें।',
        'advisoryHotDryHeadline': 'गर्म और शुष्क मौसम',
        'advisoryHotDryDetail': 'उच्च तापमान और कम नमी के कारण फसलों में पानी की मांग बढ़ सकती है। मिट्टी की नमी जांचें और आवश्यकता पड़ने पर सिंचाई करें।',
        'advisoryHotDryRec': '💧 सिफारिश: यदि मिट्टी में नमी कम है तो शीघ्र सिंचाई करें।',
        'advisoryModerateHeadline': 'मध्यम पानी की आवश्यकता',
        'advisoryModerateDetail': 'गर्म मौसम से पानी की आवश्यकता बढ़ सकती है। सिंचाई से पहले मिट्टी की नमी जांचें।',
        'advisoryModerateRec': '💧 सिफारिश: सिंचाई से पहले मिट्टी की नमी जांचें।',
        'advisoryNormalHeadline': 'सामान्य सिंचाई स्थिति',
        'advisoryNormalDetail': 'मौसम के अनुसार तुरंत सिंचाई की आवश्यकता नहीं दिखती। पानी देने से पहले मिट्टी की नमी और फसल की आवश्यकता जांचें।',
        'advisoryNormalRec': '💧 सिफारिश: नियमित सिंचाई कार्यक्रम का पालन करें।'
    },
    'ta': {
        'searchBtn': 'தேடு',
        'condClearSky': 'தெளிவான வானம்',
        'condMainlyClear': 'பெரும்பாலும் தெளிவானது',
        'condPartlyCloudy': 'பகுதி மேகமூட்டம்',
        'condOvercast': 'மேகமூட்டம்',
        'condFoggy': 'மூடுபனி',
        'condRimeFog': 'அடர்ந்த மூடுபனி',
        'condLightDrizzle': 'லேசான தூறல்',
        'condDrizzle': 'தூறல்',
        'condHeavyDrizzle': 'கனமான தூறல்',
        'condLightRain': 'லேசான மழை',
        'condRain': 'மழை',
        'condHeavyRain': 'கனமழை',
        'condLightSnow': 'லேசான பனிப்பொழிவு',
        'condSnow': 'பனிப்பொழிவு',
        'condHeavySnow': 'கடுமையான பனிப்பொழிவு',
        'condRainShowers': 'மழை பொழிவு',
        'condHeavyRainShowers': 'பலத்த மழைப்பொழிவு',
        'condThunderstorm': 'இடியுடன் கூடிய மழை',
        'condThunderstormHail': 'ஆலங்கட்டி மழை',
        'condSevereThunderstorm': 'கடுமையான இடியுடன் கூடிய மழை',
        'advisoryRainLikelyHeadline': 'மழைக்கு வாய்ப்புள்ளது',
        'advisoryRainLikelyDetail': 'தற்போது மழை பெய்கிறது அல்லது அதிக வாய்ப்புள்ளது. தேவையற்ற நீர் பயன்பாட்டைத் தவிர்க்க பாசனத்தைத் தள்ளிப்போடுங்கள்.',
        'advisoryRainLikelyRec': '💧 பரிந்துரை: அடுத்த சில மணிநேரங்களுக்கு பாசனம் செய்வதைத் தவிர்க்கவும்.',
        'advisoryHotDryHeadline': 'வெப்பமான மற்றும் வறண்ட நிலை',
        'advisoryHotDryDetail': 'அதிக வெப்பநிலை மற்றும் குறைந்த ஈரப்பதம் காரணமாக பயிர்களுக்கு நீர் தேவை அதிகரிக்கலாம். மண்ணின் ஈரப்பதத்தை சரிபார்த்து தேவைப்பட்டால் பாசனம் செய்யுங்கள்.',
        'advisoryHotDryRec': '💧 பரிந்துரை: மண்ணில் ஈரப்பதம் குறைவாக இருந்தால் விரைவில் பாசனம் செய்யுங்கள்.',
        'advisoryModerateHeadline': 'மிதமான நீர் தேவை',
        'advisoryModerateDetail': 'வெப்பமான நிலைமைகளால் நீர் தேவை அதிகரிக்கலாம். பாசனத்திற்கு முன் மண்ணின் ஈரப்பதத்தை சரிபார்க்கவும்.',
        'advisoryModerateRec': '💧 பரிந்துரை: பாசனத்திற்கு முன் மண்ணின் ஈரப்பதத்தை சரிபார்க்கவும்.',
        'advisoryNormalHeadline': 'வழக்கமான பாசன நிலைமைகள்',
        'advisoryNormalDetail': 'உடனடி பாசனத்திற்கான வலுவான வானிலை அறிகுறி எதுவும் இல்லை. நீர் பாய்ச்சுவதற்கு முன் மண்ணின் ஈரப்பதம் மற்றும் பயிர் தேவையை சரிபார்க்கவும்.',
        'advisoryNormalRec': '💧 பரிந்துரை: வழக்கமான பாசன அட்டவணையைப் பின்பற்றுங்கள்.'
    },
    'te': {
        'searchBtn': 'శోధించు',
        'condClearSky': 'నిర్మలమైన ఆకాశం',
        'condMainlyClear': 'ఎక్కువగా నిర్మలంగా ఉంది',
        'condPartlyCloudy': 'పాక్షికంగా మేఘావృతం',
        'condOvercast': 'మేఘావృతం',
        'condFoggy': 'పొగమంచు',
        'condRimeFog': 'దట్టమైన పొగమంచు',
        'condLightDrizzle': 'తేలికపాటి చినుకులు',
        'condDrizzle': 'చిరుజల్లు',
        'condHeavyDrizzle': 'భారీ చిరుజల్లు',
        'condLightRain': 'తేలికపాటి వర్షం',
        'condRain': 'వర్షం',
        'condHeavyRain': 'భారీ వర్షం',
        'condLightSnow': 'తేలికపాటి మంచు',
        'condSnow': 'మంచు',
        'condHeavySnow': 'భారీ మంచు',
        'condRainShowers': 'వర్షపు జల్లులు',
        'condHeavyRainShowers': 'భారీ వర్షపు జల్లులు',
        'condThunderstorm': 'ఉరుములతో కూడిన వర్షం',
        'condThunderstormHail': 'వడగండ్ల వర్షం',
        'condSevereThunderstorm': 'తీవ్రమైన ఉరుములతో కూడిన తుఫాను',
        'advisoryRainLikelyHeadline': 'వర్షం కురిసే అవకాశం ఉంది',
        'advisoryRainLikelyDetail': 'ప్రస్తుతం వర్షం పడుతోంది లేదా అధిక సంభావ్యత ఉంది. నీటి వృధాను నివారించడానికి నీటిపారుదలను వాయిదా వేయండి.',
        'advisoryRainLikelyRec': '💧 సిఫార్సు: రాబోయే కొన్ని గంటల పాటు నీటిపారుదలని నివారించండి.',
        'advisoryHotDryHeadline': 'వేడి మరియు పొడి పరిస్థితులు',
        'advisoryHotDryDetail': 'అధిక ఉష్ణోగ్రత మరియు తక్కువ తేమ కారణంగా పంటల నీటి అవసరం పెరగవచ్చు. నేలలోని తేమను తనిఖీ చేసి అవసరమైతే నీటిపారుదల చేయండి.',
        'advisoryHotDryRec': '💧 సిఫార్సు: నేలలో తేమ తక్కువగా ఉంటే త్వరగా నీటిపారుదల చేయండి.',
        'advisoryModerateHeadline': 'మధ్యస్థ నీటి అవసరం',
        'advisoryModerateDetail': 'వెచ్చని పరిస్థితుల వల్ల నీటి డిమాండ్ పెరగవచ్చు. నీటిపారుదలకు ముందు నేల తేమను తనిఖీ చేయండి.',
        'advisoryModerateRec': '💧 సిఫార్సు: నీటిపారుదలకు ముందు నేల తేమను తనిఖీ చేయండి.',
        'advisoryNormalHeadline': 'సాధారణ నీటిపారుదల పరిస్థితులు',
        'advisoryNormalDetail': 'తక్షణ నీటిపారుదలకు బలమైన వాతావరణ సంకేతం లేదు. నీరు పెట్టే ముందు అసలు నేల తేమ మరియు పంట అవసరాలను తనిఖీ చేయండి.',
        'advisoryNormalRec': '💧 సిఫార్సు: సాధారణ నీటిపారుదల షెడ్యూల్‌ను అనుసరించండి.'
    }
}

schemes_additions = {
    'en': {
        'catFinancialSupport': 'Farmer Financial Support',
        'catCropInsurance': 'Crop Insurance',
        'catIrrigation': 'Irrigation & Water',
        'catFarmMachinery': 'Farm Machinery & Tools',
        'catSoilFertilizer': 'Soil & Fertilizer',
        'catCreditLoans': 'Credit & Loans',
        'catHorticulture': 'Horticulture & Organic',
        'catLivestock': 'Livestock & Animal Husbandry',
        'catInfrastructure': 'Agriculture Infrastructure',
        'catDirectBenefit': 'Direct Income Support',
        'catFarmInfrastructure': 'Farm Infrastructure & Solar',
        'catCropInsuranceRisk': 'Crop Insurance & Risk',
        'countLabel': '{{count}} Schemes',
        'countSingle': '1 Scheme',
        'refresh': 'Refresh',
        'benefit': 'Benefit',
        'govt': 'Govt',
        'allIndia': 'All India',
        'modalTitle': 'Scheme Details',
        'eligibleTitle': 'You appear to meet the primary criteria based on official guidelines',
        'notEligibleTitle': 'You may not meet some of the required official eligibility conditions',
        'eligibleRecommendation': 'You are likely eligible for this scheme. Proceed to the official portal to complete registration with your 7/12 and Aadhaar details.',
        'notEligibleRecommendation': 'Please review the unmatched criteria above or consult your local Taluka Agriculture Officer / CSC center.'
    },
    'mr': {
        'catFinancialSupport': 'शेतकरी आर्थिक सहाय्य',
        'catCropInsurance': 'पीक विमा',
        'catIrrigation': 'सिंचन आणि पाणी',
        'catFarmMachinery': 'शेती अवजारे आणि यंत्रसामग्री',
        'catSoilFertilizer': 'माती आणि खते',
        'catCreditLoans': 'पतपुरवठा आणि कर्ज',
        'catHorticulture': 'फलोत्पादन आणि सेंद्रिय शेती',
        'catLivestock': 'पशुसंवर्धन आणि दुग्धव्यवसाय',
        'catInfrastructure': 'कृषी पायाभूत सुविधा',
        'catDirectBenefit': 'थेट उत्पन्न सहाय्य',
        'catFarmInfrastructure': 'शेती पायाभूत सुविधा व सौर ऊर्जा',
        'catCropInsuranceRisk': 'पीक विमा आणि जोखीम',
        'countLabel': '{{count}} योजना',
        'countSingle': '१ योजना',
        'refresh': 'रिफ्रेश',
        'benefit': 'लाभ',
        'govt': 'शासन',
        'allIndia': 'संपूर्ण भारत',
        'modalTitle': 'योजनेचा तपशील',
        'eligibleTitle': 'अधिकृत नियमांनुसार तुम्ही प्राथमिक निकष पूर्ण करत असल्याचे दिसते',
        'notEligibleTitle': 'तुम्ही काही आवश्यक अधिकृत पात्रता अटी पूर्ण करू शकत नाही',
        'eligibleRecommendation': 'तुम्ही या योजनेसाठी पात्र असण्याची दाट शक्यता आहे. ७/१२ आणि आधार तपशीलांसह नोंदणी पूर्ण करण्यासाठी अधिकृत पोर्टलवर जा.',
        'notEligibleRecommendation': 'कृपया वरील अपूर्ण अटी तपासा किंवा तुमच्या स्थानिक तालुका कृषी अधिकारी / सीएससी केंद्राशी संपर्क साधा.'
    },
    'hi': {
        'catFinancialSupport': 'किसान वित्तीय सहायता',
        'catCropInsurance': 'फसल बीमा',
        'catIrrigation': 'सिंचाई और पानी',
        'catFarmMachinery': 'कृषि मशीनरी और उपकरण',
        'catSoilFertilizer': 'मृदा और उर्वरक',
        'catCreditLoans': 'ऋण और ऋण सहायता',
        'catHorticulture': 'बागवानी और जैविक खेती',
        'catLivestock': 'पशुपालन और डेयरी',
        'catInfrastructure': 'कृषि अवसंरचना',
        'catDirectBenefit': 'प्रत्यक्ष आय सहायता',
        'catFarmInfrastructure': 'कृषि अवसंरचना एवं सोलर',
        'catCropInsuranceRisk': 'फसल बीमा एवं जोखिम',
        'countLabel': '{{count}} योजनाएं',
        'countSingle': '1 योजना',
        'refresh': 'ताज़ा करें',
        'benefit': 'लाभ',
        'govt': 'सरकार',
        'allIndia': 'अखिल भारतीय',
        'modalTitle': 'योजना विवरण',
        'eligibleTitle': 'आधिकारिक दिशानिर्देशों के अनुसार आप प्राथमिक मानदंडों को पूरा करते प्रतीत होते हैं',
        'notEligibleTitle': 'आप कुछ आवश्यक आधिकारिक पात्रता शर्तों को पूरा नहीं करते होंगे',
        'eligibleRecommendation': 'आप इस योजना के लिए पात्र हो सकते हैं। अपने 7/12 और आधार विवरण के साथ पंजीकरण पूरा करने के लिए आधिकारिक पोर्टल पर जाएं।',
        'notEligibleRecommendation': 'कृपया ऊपर दी गई शर्तों की समीक्षा करें या अपने स्थानीय कृषि अधिकारी / सीएससी केंद्र से संपर्क करें.'
    },
    'ta': {
        'catFinancialSupport': 'விவசாய நிதி உதவி',
        'catCropInsurance': 'பயிர் காப்பீடு',
        'catIrrigation': 'பாசனம் மற்றும் நீர்',
        'catFarmMachinery': 'பண்ணை இயந்திரங்கள்',
        'catSoilFertilizer': 'மண் மற்றும் உரம்',
        'catCreditLoans': 'கடன் வசதிகள்',
        'catHorticulture': 'தோட்டக்கலை மற்றும் இயற்கை விவசாயம்',
        'catLivestock': 'கால்நடை பராமரிப்பு',
        'catInfrastructure': 'வேளாண் உள்கட்டமைப்பு',
        'catDirectBenefit': 'நேரடி வருமான ஆதரவு',
        'catFarmInfrastructure': 'பண்ணை உள்கட்டமைப்பு மற்றும் சூரிய சக்தி',
        'catCropInsuranceRisk': 'பயிர் காப்பீடு மற்றும் இடர்',
        'countLabel': '{{count}} திட்டங்கள்',
        'countSingle': '1 திட்டம்',
        'refresh': 'புதுப்பி',
        'benefit': 'பலன்',
        'govt': 'அரசு',
        'allIndia': 'அகில இந்தியா',
        'modalTitle': 'திட்ட விவரங்கள்',
        'eligibleTitle': 'அதிகாரப்பூர்வ வழிகாட்டுதல்களின்படி நீங்கள் முதன்மை தகுதிகளைப் பூர்த்தி செய்கிறீர்கள்',
        'notEligibleTitle': 'சில தேவையான அதிகாரப்பூர்வ நிபந்தனைகளை நீங்கள் பூர்த்தி செய்யாமல் இருக்கலாம்',
        'eligibleRecommendation': 'இந்தத் திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்புள்ளது. உங்கள் 7/12 மற்றும் ஆதார் விவரங்களுடன் பதிவு செய்ய அதிகாரப்பூர்வ தளத்திற்குச் செல்லவும்.',
        'notEligibleRecommendation': 'பொருந்தாத நிபந்தனைகளை சரிபார்க்கவும் அல்லது உள்ளூர் வேளாண் அலுவலரைத் தொடர்பு கொள்ளவும்.'
    },
    'te': {
        'catFinancialSupport': 'రైతు ఆర్థిక సహాయం',
        'catCropInsurance': 'పంట బీమా',
        'catIrrigation': 'నీటిపారుదల & నీరు',
        'catFarmMachinery': 'వ్యవసాయ యంత్రాలు & పరికరాలు',
        'catSoilFertilizer': 'నేల & ఎరువులు',
        'catCreditLoans': 'రుణాలు & క్రెడిట్',
        'catHorticulture': 'ఉద్యానవనం & సేంద్రీయ వ్యవసాయం',
        'catLivestock': 'పశుసంవర్ధక శాఖ',
        'catInfrastructure': 'వ్యవసాయ మౌలిక సదుపాయాలు',
        'catDirectBenefit': 'ప్రత్యక్ష ఆదాయ సహాయం',
        'catFarmInfrastructure': 'వ్యవసాయ మౌలిక సదుపాయాలు & సోలార్',
        'catCropInsuranceRisk': 'పంట బీమా & రిస్క్',
        'countLabel': '{{count}} పథకాలు',
        'countSingle': '1 పథకం',
        'refresh': 'తాజాకరించు',
        'benefit': 'ప్రయోజనం',
        'govt': 'ప్రభుత్వం',
        'allIndia': 'అఖిల భారత',
        'modalTitle': 'పథకం వివరాలు',
        'eligibleTitle': 'అధికారిక మార్గదర్శకాల ప్రకారం మీరు ప్రాథమిక ప్రమాణాలకు అనుగుణంగా ఉన్నారు',
        'notEligibleTitle': 'మీరు కొన్ని అధికారిక అర్హత నిబంధనలను పూర్తి చేయకపోవచ్చు',
        'eligibleRecommendation': 'ఈ పథకానికి మీరు అర్హులు కావచ్చు. మీ 7/12 మరియు ఆధార్ వివరాలతో నమోదు చేసుకోవడానికి అధికారిక పోర్టల్‌కు వెళ్లండి.',
        'notEligibleRecommendation': 'దయచేసి పైన పేర్కొన్న నిబంధనలను సమీక్షించండి లేదా స్థానిక వ్యవసాయ అధికారి / సిఎస్‌సి కేంద్రాన్ని సంప్రదించండి.'
    }
}

# Let's read frontend/js/language.js
with open('frontend/js/language.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Let's use Node.js script to merge and write back language.js accurately
node_updater = '''
const fs = require('fs');
const path = 'frontend/js/language.js';
let content = fs.readFileSync(path, 'utf8');

// We evaluate LanguageModule in VM
const vm = require('vm');
const sandbox = { window: {}, document: { addEventListener: () => {} }, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(content, sandbox);

const t = sandbox.window.LanguageModule.translations;
const weatherAdditions = %s;
const schemesAdditions = %s;

for (const lang of ['en', 'mr', 'hi', 'ta', 'te']) {
    Object.assign(t[lang].weather, weatherAdditions[lang]);
    Object.assign(t[lang].schemes, schemesAdditions[lang]);
}

// Generate the updated JS file
const updatedTranslationsStr = JSON.stringify(t, null, 2);

// Replace translations block
const startIdx = content.indexOf('  translations: {');
const endMarker = '  init() {';
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not locate translations boundary');
    process.exit(1);
}

// Make sure updateDOM calls WeatherModule.refreshTranslations() instead of refreshStatusCopy()
let methodsPart = content.slice(endIdx);
methodsPart = methodsPart.replace(
    'if (window.WeatherModule && typeof window.WeatherModule.refreshStatusCopy === \\'function\\') {\\n      window.WeatherModule.refreshStatusCopy();\\n    }',
    'if (window.WeatherModule && typeof window.WeatherModule.refreshTranslations === \\'function\\') {\\n      window.WeatherModule.refreshTranslations();\\n    }'
);

const newContent = content.slice(0, startIdx) + '  translations: ' + updatedTranslationsStr + ',\\n\\n  ' + methodsPart;
fs.writeFileSync(path, newContent, 'utf8');
console.log('Successfully updated language.js');
''' % (json.dumps(weather_additions), json.dumps(schemes_additions))

with open('scratch/run_update.js', 'w', encoding='utf-8') as f:
    f.write(node_updater)

res = subprocess.run(['node', 'scratch/run_update.js'], capture_output=True, text=True)
print(res.stdout)
print(res.stderr)

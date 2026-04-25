/**
 * İsimlerdeki Türkçe karakterleri İngilizce karakterlere çevirir, gereksiz boşlukları siler,
 * tüm metni küçük harfe çevirir ve peş peşe tekrarlanan harfleri teke indirir (örn: Alicann -> alican).
 * Böylece veri kaynaklarından gelen isim tutarsızlıklarını engelleriz.
 *
 * @param {string} rawName - Normalize edilecek ham isim stringi
 * @returns {string} - Temizlenmiş, standardize edilmiş isim (ID veya Eşleştirme için)
 */
export const normalizeName = (rawName) => {
    if (!rawName || typeof rawName !== 'string') return 'unknown';

    const charMap = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    };

    // 1. Tüm string'i küçük harfe çevirelim (To Lowercase)
    let normalized = rawName.toLowerCase().trim();

    // 2. Türkçe karakterleri İngilizce eşleniklerine çevirelim (Replace Turkish Chars)
    normalized = normalized.replace(/[çğıiöşüÇĞIİÖŞÜ]/g, (match) => charMap[match]);

    // 3. İsim harici özel karakterleri silelim (Opsiyonel ama güvenlik/temizlik açısından iyi)
    normalized = normalized.replace(/[^a-z\s]/g, '');

    // 4. Peş peşe gelen aynı harfleri tekilleştir (örn: alicann -> alican, aliccaann -> alican)
    normalized = normalized.replace(/(.)\1+/g, '$1');

    return normalized.trim() || 'unknown';
};

/**
 * Jotform'dan gelen zaman (timestamp) bilgisini tek bir JS Date objesine veya 
 * ISO 8601 stringine (Örn: 2026-04-25T14:30:00.000Z) çevirir. 
 * Kronolojik sıralamalar (Master Timeline vb.) bu dönen değer üstünden yapılmalıdır.
 *
 * @param {string|number} rawDate - Date parse edilebilecek herhangi bir string ya da unix timestamp
 * @returns {number} Unix Timestamp değeri (Sıralamalar için en iyisi). Geçersizse 0.
 */
export const normalizeDateObjToTimestamp = (rawDate) => {
    if (!rawDate) return 0;

    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
        return 0; // Eğer parse edilemiyorsa en başa atması için
    }

    // Kronolojik sıralama için Unix Zaman Damgası milisaniye cinsinden dönüyoruz
    return parsedDate.getTime();
};

/**
 * Tüm bu veriyi kullanırken formdaki answers objesi genellikle numerik key'ler (1, 2, 3...) üzerinden geliyor 
 * ve `name` veya `text` değerleri saklıyor. Bu metod Jotform'dan gelen yanıtları düz, standart bir Objeye çevirir.
 */
export const extractJotformAnswers = (answersObj) => {
    if (!answersObj) return {};

    const extracted = {};
    for (const key in answersObj) {
        const answerData = answersObj[key];
        if (answerData && answerData.name) {
            // answerData.answer string, number, array ya da obje olabilir.
            // Jotform location alanları array vs. olabilir. O yüzden varsa "answer" property'sini al.
            const camelCaseKey = answerData.name.toLowerCase();
            extracted[camelCaseKey] = answerData.answer || answerData.text || null;
        }
    }
    return extracted;
};

/**
 * GPS / Coordinates text'ini parse edip [latitude, longitude] array formatına döndürür (Leaflet harita kullanımı için).
 * @param {string} rawCoordinates - Örn: "40.7128, -74.0060"
 * @returns {number[]} - Örn: [40.7128, -74.0060]
 */
export const normalizeCoordinates = (rawCoordinates) => {
    if (!rawCoordinates || typeof rawCoordinates !== 'string') return null;

    const parts = rawCoordinates.split(',');
    if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());

        if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
        }
    }
    return null; // Koordinat bulunamazsa
};

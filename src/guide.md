Aşağıdaki metni kopyalayıp bir `.md` dosyası olarak kaydedebilir veya doğrudan Copilot'a yapıştırabilirsin. Bu doküman, Copilot'un veri yapısını anlamasını, API entegrasyonunu yapmasını ve istenen sayfaları oluşturmasını sağlayacak şekilde optimize edilmiştir.

---

# Proje Spesifikasyonu: Podo Takip (Dijital Dedektiflik Arayüzü)

## 1. Proje Amacı
Bu uygulama, parçalanmış verileri (JSON) bir araya getirerek "Podo" isimli karakteri kimin kaçırdığını bulmayı amaçlayan bir dedektiflik panelidir. Uygulama, zaman, mekan ve kişi ilişkilerini analiz ederek kullanıcıya somut kanıtlar sunmalıdır.

## 2. API Entegrasyonu
Tüm veriler Jotform API üzerinden çekilecektir. İstekler aşağıdaki formatta yapılmalıdır:

* **Endpoint:** `https://api.jotform.com/form/{formID}/submissions?apiKey={apiKey}`
* **Method:** GET
* **Veri Formatı:** JSON (Response içerisindeki `content` dizisi kullanılacaktır).

## 3. Veri Kaynakları ve İlişkisel Mantık
Uygulama 5 farklı kaynaktan gelen verileri birleştirmelidir:

1.  **Checkins:** Kişilerin GPS üzerinden kesinleşmiş konum ve zaman verileri.
2.  **Messages:** Kişiler arası iletişim. Niyet ve planları içerir.
3.  **Sightings:** Görgü tanığı raporları. Kim, kiminle, nerede görüldü?
4.  **Personal Notes:** Kişilerin kendi beyanları (Çelişkiler genellikle burada gizlidir).
5.  **Anonymous Tips:** Dışarıdan gelen, güven skoru (`confidence`) olan ihbarlar.

### Kritik İlişki Anahtarları (Join Keys):
* **Zaman (`timestamp`):** Tüm verileri kronolojik sıraya dizmek için kullanılır.
* **Kişi (`fullname`, `from`, `to`, `personName`, `suspectName`):** Verileri bir şüpheli profili altında toplamak için kullanılır.
* **Konum (`coordinates`, `location`):** Kişilerin yollarının çakıştığı anları tespit etmek için kullanılır.

## 4. Sayfa Yapıları ve Fonksiyonlar

### A. Dashboard (Genel Bakış)
* Podo'nun son görüldüğü konumu ve zamanı vurgulayan özet kartlar.
* Toplam veri trafiği istatistikleri.
* Global Arama: Tüm tablolarda isim veya metin bazlı arama.

### B. Şüpheliler Listesi (Suspects)
* **Fonksiyon:** Tüm kaynaklardaki isimleri normalize ederek (Örn: "Alican", "ALICAN" ve "Alicann" aynı kişi sayılmalı) tekilleştirilmiş bir liste sunar.
* **Tablo:** İsim, Son Görülme, Durum (Şüpheli/Tanık), Risk Skoru.
* **Filtreleme:** İsme göre arama, risk seviyesine göre filtreleme.

### C. Master Timeline (Zaman Tüneli)
* **Fonksiyon:** 5 farklı veri kaynağını `timestamp` üzerinden birleştirerek tek bir akışta listeler.
* **İlişkilendirme:** Bir mesajın hemen ardından gelen bir check-in kaydı alt alta gösterilmelidir.
* **Filtreleme:** Veri kaynağına göre (Sadece mesajlar, sadece ihbarlar vb.) toggle filtreler.

### D. Kişi Detay Sayfası (Person Detail)
* **Kişisel Bilgi:** O kişiye ait tüm check-in geçmişi.
* **Mesaj Trafiği:** Podo ile yaptığı tüm konuşmalar (Kronolojik).
* **Görülme Kayıtları:** O kişinin kimlerle beraber görüldüğüne dair `Sightings` verileri.
* **Çelişki Analizi:** Kişinin kendi notu (`Personal Notes`) ile GPS verisi (`Checkins`) arasındaki tutarsızlıkları yan yana listeleme.

### E. Harita Görünümü (Map View)
* `coordinates` verilerini kullanarak harita üzerinde pinler oluşturma.
* Aynı zaman diliminde birbirine yakın olan koordinatları görsel olarak gruplama.

## 5. Teknik Gereksinimler & Logic
* **Data Normalization:** İsimlerdeki Türkçe karakter farklılıkları ve yazım hataları (Alicann/Alican) kod tarafında sanitize edilerek aynı ID ile eşleştirilmelidir.
* **Searching & Filtering:** Tüm tablo sayfalarında anlık (client-side) arama ve filtreleme özellikleri bulunmalıdır.
* **UI/UX:** Bir dedektiflik teması (Koyu mod, veri odaklı tablolar, uyarıcı renkli ihbar kartları) tercih edilmelidir.

---
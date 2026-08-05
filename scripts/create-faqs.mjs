import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const faqs = [
  {
    slug: "cep-telefonu-tamirinin-ekonomiye-ve-cari-aciga-faydalari",
    title: "Cep Telefonu Tamirinin Ekonomiye ve Cari Açığa Faydaları Nelerdir?",
    content: "Cep telefonu tamiri, yalnızca bireysel bütçenizi korumakla kalmaz, aynı zamanda makro ekonomide de büyük bir rol oynar. Her yıl milyonlarca yeni cihazın ithal edilmesi, ülkemizin dış ticaret açığını (cari açık) artıran en büyük etkenlerden biridir. Cihazınızı çöpe atmak yerine uyumlu ve kaliteli yedek parçalarla tamir ettirmek, ithalatı yavaşlatır ve dövizin ülkemizde kalmasını sağlar. Ayrıca, elektronik atık (e-waste) miktarını azaltarak çevresel sürdürülebilirliğe devasa bir katkı sunar."
  },
  {
    slug: "ikinci-el-veya-yenilenmis-telefon-alirken-nelere-dikkat-edilmeli",
    title: "İkinci El veya Yenilenmiş Telefon Alırken Nelere Dikkat Edilmeli?",
    content: "İkinci el veya yenilenmiş (refurbished) cihaz alırken en önemli nokta, cihazın güvenilir bir merkez tarafından test edilmiş olmasıdır. Ekranın dokunmatik hassasiyeti, bataryanın devir sayısı ve şarj entegresinin durumu kontrol edilmelidir. Ayrıca Yenilenmiş Ürün Bilgi Sistemi (YÜBİS) üzerinden cihazın dijital kimliği sorgulanabilir. Alacağınız cihazda değişen parçalar varsa, bunların uyumlu, kaliteli ve sertifikalı parçalar olmasına dikkat edin."
  },
  {
    slug: "soft-oled-ve-hard-oled-ekran-arasindaki-fark-nedir",
    title: "Soft OLED ve Hard OLED Ekran Arasındaki Fark Nedir?",
    content: "Cep telefonu ekranı kırıldığında karşınıza iki ana seçenek çıkar: Soft OLED (Yumuşak) ve Hard OLED (Sert). Soft OLED ekranlar, plastik esnek bir alt tabakaya sahiptir, bu nedenle darbelere ve düşmelere karşı kinetik enerjiyi emerek çok yüksek dayanıklılık gösterir. Hard OLED ekranlar ise cam bir alt tabaka kullanır; renk kaliteleri çok iyi olsa da esneme payları olmadığı için sert düşüşlerde içten kırılma riski daha yüksektir. Uyumlu ve kaliteli bir Soft OLED ekran, fabrikasyon deneyimine en yakın performansı sunar."
  },
  {
    slug: "uyumlu-ve-kaliteli-batarya-kullanimi-telefonu-bozar-mi",
    title: "Uyumlu ve Kaliteli Batarya Kullanımı Telefonu Bozar mı?",
    content: "Hayır, telefonu bozmaz. Akıllı telefon bataryaları lityum-iyon (Li-ion) teknolojisine dayanır ve ortalama 500 şarj döngüsü sonrasında kapasitelerini kaybederler. Değişim vakti geldiğinde, CE ve RoHS sertifikalarına sahip, yüksek performanslı, uyumlu ve kaliteli bir yedek batarya kullanmak telefonunuzun ömrünü güvenle uzatır. Önemli olan, ucuz ve merdiven altı pillerden uzak durarak, voltaj değerleri test edilmiş sertifikalı ürünleri tercih etmektir."
  },
  {
    slug: "bms-batarya-yonetim-sistemi-aktarimi-nedir",
    title: "BMS (Batarya Yönetim Sistemi) Aktarımı Nedir, Neden Yapılır?",
    content: "Bazı modern akıllı telefonlar, anakartları ile bataryaları arasında kriptografik bir eşleştirme kullanır. Eski bataryanızdaki BMS (Batarya Yönetim Sistemi) çipini, yeni aldığınız yüksek kaliteli batarya hücresine aktarma işlemine BMS aktarımı denir. Bu işlem sayesinde cihazınız yeni pili sorunsuz tanır, pil sağlığı yüzdesini tam gösterir ve ayarlar menüsünde 'Bilinmeyen Parça' gibi uyarılar vermez."
  },
  {
    slug: "onemli-pil-mesaji-uyarisi-neden-cikar",
    title: "\"Önemli Pil Mesajı\" Uyarısı Neden Çıkar?",
    content: "Bu uyarı genellikle cihazın bataryası değiştirildiğinde, cihazın anakartının yeni bataryadaki güvenlik çipini tanımamasından kaynaklanır. Bataryanız birinci sınıf, uyumlu ve tam kapasiteli kaliteli bir batarya olsa dahi, üretici kısıtlamaları gereği bu mesaj çıkabilir. Performansa hiçbir olumsuz etkisi yoktur. Eğer bu uyarıyı görmek istemiyorsanız, teknisyenden BMS (Batarya Yönetim Sistemi) aktarımı yapmasını talep edebilirsiniz."
  },
  {
    slug: "statik-elektrik-esd-telefon-anakartina-nasil-zarar-verir",
    title: "Statik Elektrik (ESD) Telefon Anakartına Nasıl Zarar Verir?",
    content: "İnsan vücudunda günlük hayatta yürürken veya sürtünürken 3.000 Volt'a kadar statik elektrik birikebilir. Telefonunuzu tamir ederken, anakarttaki mikroskobik yollara veya ekran soketine çıplak elle dokunursanız, bu statik elektrik devrelere boşalır (Elektrostatik Deşarj - ESD). Sadece 100 Volt'luk bir deşarj bile çipleri yakarak cihazı kullanılamaz hale getirebilir. Bu yüzden profesyonel tamirlerde anti-statik bileklikler ve esd cımbızlar kullanılmalıdır."
  },
  {
    slug: "telefon-ekrani-yapistirilirken-hangi-kimyasallar-kullanilir",
    title: "Telefon Ekranı Yapıştırılırken Hangi Kimyasallar Kullanılır?",
    content: "Ekran ve arka kapak montajlarında sıvı endüstriyel yapıştırıcılar (örneğin B7000) veya özel çift taraflı bantlar kullanılır. B7000, kuruduğunda esnek ve kauçuksu bir yapı alan oldukça dayanıklı bir malzemedir. Ancak, daha profesyonel ve sıvı temasına karşı dirençli bir yalıtım isteniyorsa, fabrikasyon standartlarında olan yüksek tutunma gücüne sahip özel izolasyon bantları (örn. Tesa) tercih edilmelidir."
  },
  {
    slug: "yan-sanayi-ve-kalitesiz-sarj-aleti-kullanmanin-zararlari",
    title: "Yan Sanayi ve Kalitesiz Şarj Aleti Kullanmanın Zararları Nelerdir?",
    content: "Kalitesiz ve merdiven altı şarj adaptörleri, şebekeden gelen dalgalı akımı düzgün filtreleyemez. Bu dalgalı (kirli) voltaj, telefonunuzun güç yönetim entegrelerini (IC) zamanla yakar. Telefonunuz kapalıyken bile şarjı hızla bitmeye başlar. Bu devasa masraflardan kaçınmak için, Power Delivery (PD) veya Quick Charge (QC) destekli, sertifikalı ve kaliteli muadil adaptörleri güvenle kullanabilirsiniz."
  },
  {
    slug: "telefon-anakart-tamiri-mikrolehimleme-nedir",
    title: "Telefon Anakart Tamiri (Mikrolehimleme) Nedir?",
    content: "Cep telefonu anakartları binlerce mikroskobik bileşenden oluşur. Sıvı teması, darbe veya yanlış şarj aleti kullanımı sonucu anakarttaki çipler yandığında, cihazı çöpe atmak yerine mikrolehimleme (micro-soldering) işlemi yapılır. Özel mikroskoplar ve sıcak hava istasyonları eşliğinde milimetrik çipler değiştirilerek telefon hayata döndürülür ve içerisindeki veriler kurtarılır."
  },
  {
    slug: "yedek-parca-siparisi-vermeden-once-model-tespiti",
    title: "Yedek Parça Siparişi Vermeden Önce Model Tespiti Nasıl Yapılır?",
    content: "Aynı marka ve model ismiyle satılan cihazların bile ülkeden ülkeye farklı işlemci veya soket versiyonları olabilir. Doğru parçayı sipariş etmek için, telefonun ayarlar menüsünden 'Model Numarası'nı kontrol etmeli veya bilgisayara bağlayarak profesyonel teşhis yazılımlarıyla tam cihaz kimliğini (Revizyon Kodu) öğrenmelisiniz. Böylece uyumlu yedek parça siparişinizde hata payı sıfıra iner."
  },
  {
    slug: "uzay-montaj-metodu-nedir-ekran-testi-nasil-yapilir",
    title: "Uzay Montaj Metodu Nedir ve Ekran Testi Nasıl Yapılır?",
    content: "Yeni aldığınız bir ekranı doğrudan telefona yapıştırmak büyük bir hatadır. Uzay montaj metodu, ekranın jelatinlerini sökmeden ve kasaya yapıştırmadan, sadece soketinden anakarta bağlanarak dışarıdan test edilmesidir. Renkleri, dokunmatiğin her köşesini test ettikten sonra sorunsuz olduğuna emin olunca montaj işlemini kalıcı olarak yapmalısınız."
  },
  {
    slug: "arka-kapak-degisimi-telefonun-sogutma-performansini-etkiler-mi",
    title: "Arka Kapak Değişimi Telefonun Soğutma Performansını Etkiler mi?",
    content: "Evet, etkiler. Telefonların arka kapakları ısıyı tahliye eden özel grafit katmanlar barındırır. Çok ucuza alınan kalitesiz plastik kapaklar cihazın oyun oynarken veya video çekerken aşırı ısınmasına yol açabilir. Bu nedenle, üzerinde ısı dağıtıcı panelleri ve NFC bobinleri bulunan A kalite, uyumlu ve yüksek standartlı arka kapaklar tercih edilmelidir."
  },
  {
    slug: "cihazinizin-su-temasi-sonrasi-yapilmasi-gerekenler",
    title: "Cihazınızın Su Teması Sonrası Yapılması Gerekenler Nelerdir?",
    content: "Telefonunuz suya düştüğünde asla şarja takmayın ve fön makinesiyle kurutmaya çalışmayın. Cihazı hemen kapatın, SIM kart tepsisini çıkarın ve en kısa sürede profesyonel bir teknik servise ulaştırın. Pirinç dolu bir kaba koymak oksitlenmeyi (korozyonu) durdurmaz; tam tersine içerdeki nemi hapsederek anakartın kısa devre yapma sürecini hızlandırabilir."
  },
  {
    slug: "internet-uzerinden-alinan-yedek-parcalarin-iade-kosullari",
    title: "İnternet Üzerinden Alınan Yedek Parçaların İade Koşulları Nelerdir?",
    content: "Mesafeli Sözleşmeler Yönetmeliği'ne göre tüketicilerin cayma hakkı vardır. Ancak yedek parça pazarında ürünün tekrar satılabilirlik özelliğini yitirmemesi gerekir. Ekranın önündeki garanti jelatini sökülmüşse, flex kablo (film) montaj sırasında yırtılmışsa veya parçaya yapıştırıcı sürülmüşse ürün kalıcı hasar gördüğü için iade kapsamı dışında kalır. Bu nedenle test işlemlerini jelatinleri sökmeden yapmalısınız."
  },
  {
    slug: "5-yillik-tamir-ve-yedek-parca-bulundurma-hakki",
    title: "5 Yıllık Tamir ve Yedek Parça Bulundurma Hakkı Nedir?",
    content: "Türkiye Cumhuriyeti yasalarına göre (Satış Sonrası Hizmetler Yönetmeliği), teknoloji devleri sattıkları akıllı telefonlar için garanti süresi (2 yıl) bitse dahi, fatura tarihinden itibaren 5 yıl boyunca o cihaza ait yedek parçaları stoklarında bulundurmak ve ücreti karşılığında tamir hizmeti sunmak zorundadır. Aksi takdirde tüketicilerin Tüketici Hakem Heyeti aracılığıyla üst model sıfır cihaz talep etme hakkı doğabilir."
  },
  {
    slug: "sim-kart-takilan-telefon-neden-iade-edilemez",
    title: "SIM Kart Takılan Sıfır Telefon Neden İade Edilemez?",
    content: "Sıfır bir akıllı telefona SIM kart takıldığı an, cihaz şebeke sinyali alır ve IMEI numarası BTK kayıtlarında 'Aktif' statüsüne geçer. Bu işlem geri döndürülemez ve cihaz yasal olarak 'ikinci el' konumuna düşer. Bu nedenle sadece rengini beğenmediğiniz için cihazı iade etmek isterseniz, satıcı büyük bir değer kaybı yaşayacağı için Yargıtay kararlarına göre iade talebiniz reddedilebilir."
  },
  {
    slug: "kendi-telefonumu-tamir-edebilir-miyim-riskleri",
    title: "Kendi Telefonumu Tamir Edebilir miyim? Riskleri Nelerdir?",
    content: "Ekran veya arka kapak değişimi gibi modüler onarımlar, doğru el aletleriyle evde dikkatlice yapılabilir. Ancak ince flex kabloların koparılması, bataryanın sivri cisimlerle delinip alev alması (thermal runaway) veya statik elektrik deşarjı ile anakartın yakılması gibi ciddi riskler barındırır. Gerekli teknik altyapıya sahip değilseniz işlemi profesyonellere bırakmak daha ekonomik olacaktır."
  },
  {
    slug: "2026-tuketici-haklari-reformu-telefon-iadelerini-nasil-etkiliyor",
    title: "2026 Tüketici Hakları Reformu Telefon İadelerini Nasıl Etkiliyor?",
    content: "1 Ocak 2026'da yürürlüğe girecek yeni e-ticaret düzenlemeleri ile elektronik cihazlardaki cayma yasakları tüketici lehine esnetilmiştir. Cayma hakkı kapsamında iade kargo ücretleri kesinlikle tüketiciye yansıtılamayacak ve ürün iade süreci başladığında 14 gün içerisinde ücret iadesi tek seferde eksiksiz olarak satıcı tarafından yapılmak zorunda olacaktır."
  },
  {
    slug: "kaliteli-parca-ile-orijinal-deneyimi-mumkun-mu",
    title: "Kaliteli Uyumlu Parçalarla Orijinal Deneyimi Mümkün mü?",
    content: "Kesinlikle evet. Teknoloji pazarında üreticiler genellikle ekran ve batarya gibi parçaları üçüncü parti fabrikalara (OEM) ürettirir. Bu nedenle cihazın fabrika çıkış kalitesine eşdeğer, test edilmiş ve sertifikalandırılmış uyumlu kaliteli parçalar kullanarak, gereksiz yüksek marka bedelleri ödemeden tam performanslı bir kullanım ömrü elde edebilirsiniz."
  }
]

const dir = path.join(__dirname, '../src/content/faq')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

faqs.forEach(faq => {
  const fileContent = `---
title: "${faq.title}"
date: "${new Date().toISOString().split('T')[0]}"
---

${faq.content}
`
  const filePath = path.join(dir, `${faq.slug}.md`)
  fs.writeFileSync(filePath, fileContent, 'utf-8')
})

console.log(`Generated ${faqs.length} FAQ markdown files.`)

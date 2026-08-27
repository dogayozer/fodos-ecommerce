import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let cat = await prisma.category.findUnique({ where: { slug: 'yazilim' } });
  if (!cat) {
    cat = await prisma.category.create({
      data: {
        name: 'Yazılım ve Otomasyon',
        slug: 'yazilim',
        template_type: 'generic'
      }
    });
  }

  const prod = await prisma.product.upsert({
    where: { barcode: 'TEKNOSON-KARGO-01' },
    update: {
      sale_price: 4900,
      stock_qty: 9999,
      status: 'active'
    },
    create: {
      barcode: 'TEKNOSON-KARGO-01',
      model_code: 'TKN-KRG-01',
      brand: 'TEKNOSON',
      title: 'TEKNOSON Kargo Paketleme Kayıt Sistemi (Masaüstü)',
      slug: 'teknoson-kargo-paketleme-kayit-sistemi',
      description_raw: 'E-Ticaret kargo iade, eksik ürün, haksız iade itirazları için kargo paketleme masası kamera kayıt sistemi.',
      description_html: '<p>TEKNOSON Kargo Paketleme Kayıt Sistemi ile kargo süreçlerinizi güvence altına alın.</p><ul><li>Sıfır Dokunuşla Kayıt</li><li>Hızlı Bulunabilirlik</li><li>Kurye Teslim Tutanağı</li></ul><p><b>KAMPANYA: 3 MP IP KAMERA HEDİYE!</b></p>',
      reference_price: 15000,
      sale_price: 4900,
      stock_qty: 9999,
      status: 'active',
      categoryId: cat.id
    }
  });

  const prod2 = await prisma.product.upsert({
    where: { barcode: 'TEKNOSON-KARGO-02' },
    update: {
      sale_price: 3000,
      stock_qty: 9999,
      status: 'active'
    },
    create: {
      barcode: 'TEKNOSON-KARGO-02',
      model_code: 'TKN-KRG-02',
      brand: 'TEKNOSON',
      title: 'TEKNOSON Kargo Paketleme Kayıt Sistemi (WEB Hibrit)',
      slug: 'teknoson-kargo-paketleme-kayit-sistemi-hibrit',
      description_raw: 'E-Ticaret kargo iade otomasyonu için hibrit sistem.',
      description_html: '<p>TEKNOSON Kargo Paketleme Kayıt Sistemi WEB Hibrit sürümü ile süreçlerinizi buluttan yönetin.</p><ul><li>Sıfır Dokunuşla Kayıt</li><li>Hızlı Bulunabilirlik</li><li>Kurye Teslim Tutanağı</li></ul><p><b>KAMPANYA: 3 MP IP KAMERA HEDİYE!</b></p>',
      reference_price: 15000,
      sale_price: 3000,
      stock_qty: 9999,
      status: 'active',
      categoryId: cat.id
    }
  });

  console.log('Products created/updated successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

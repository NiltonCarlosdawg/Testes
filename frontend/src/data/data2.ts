import { Product } from '@/types/product'; 
// import collectionImage1 from '@/images/collections/1.png'
// import collectionImage2 from '@/images/collections/2.png'
// import collectionImage3 from '@/images/collections/3.png'
// import collectionImage4 from '@/images/collections/4.png'
// import collectionImage5 from '@/images/collections/5.png'
// import collectionImage6 from '@/images/collections/6.png'
// import collectionImage7 from '@/images/collections/7.png'
// import boothImage1 from '@/images/collections/booth1.png'
// import boothImage2 from '@/images/collections/booth2.png'
// import boothImage3 from '@/images/collections/booth3.png'
// import boothImage4 from '@/images/collections/booth4.png'
import productImage1_1 from '@/images/products/p1-1.jpg'
import productImage1_2 from '@/images/products/p1-2.jpg'
import productImage1_3 from '@/images/products/p1-3.jpg'
import productImage1 from '@/images/products/p1.jpg'
import productImage2_1 from '@/images/products/p2-1.jpg'
import productImage2_2 from '@/images/products/p2-2.jpg'
import productImage2_3 from '@/images/products/p2-3.jpg'
import productImage2 from '@/images/products/p2.jpg'
import productImage3_1 from '@/images/products/p3-1.jpg'
import productImage3_2 from '@/images/products/p3-2.jpg'
import productImage3_3 from '@/images/products/p3-3.jpg'
import productImage3 from '@/images/products/p3.jpg'
import productImage4_1 from '@/images/products/p4-1.jpg'
import productImage4_2 from '@/images/products/p4-2.jpg'
import productImage4_3 from '@/images/products/p4-3.jpg'
import productImage4 from '@/images/products/p4.jpg'
import productImage5_1 from '@/images/products/p5-1.jpg'
import productImage5_2 from '@/images/products/p5-2.jpg'
import productImage5_3 from '@/images/products/p5-3.jpg'
import productImage5 from '@/images/products/p5.jpg'
import productImage6_1 from '@/images/products/p6-1.jpg'
import productImage6_2 from '@/images/products/p6-2.jpg'
import productImage6_3 from '@/images/products/p6-3.jpg'
import productImage6 from '@/images/products/p6.jpg'
import productImage7_1 from '@/images/products/p7-1.jpg'
import productImage7_2 from '@/images/products/p7-2.jpg'
import productImage7_3 from '@/images/products/p7-3.jpg'
import productImage7 from '@/images/products/p7.jpg'
import productImage8_1 from '@/images/products/p8-1.jpg'
import productImage8_2 from '@/images/products/p8-2.jpg'
import productImage8_3 from '@/images/products/p8-3.jpg'
import productImage8 from '@/images/products/p8.jpg'
// import avatarImage1 from '@/images/users/avatar1.jpg'
// import avatarImage2 from '@/images/users/avatar2.jpg'
// import avatarImage3 from '@/images/users/avatar3.jpg'
// import avatarImage4 from '@/images/users/avatar4.jpg'
// import { shuffleArray } from '@/lib/shuffleArray'


export async function getProducts(): Promise<Product[]> {
  return [
    {
      id: 'gid://1001',
      lojaId: 'loja-001',
      titulo: 'Leather Tote Bag',
      descricao:
        'A timeless leather tote crafted from premium full-grain leather. Perfect for everyday use.',
      categoriaId: 'cat-bags',
      preco: 85,
      marca: 'LuxCouture',
      modelo: 'LTB-2025',
      condicao: 'Novo',
      quantidadeEstoque: 120,
      quantidadeMinima: 5,
      permitePedidoSemEstoque: false,
      sku: 'LTB-2025-BLK',
      codigoBarras: '987654321001',
      ativo: true,
      createdAt: '2025-05-06T10:00:00-04:00',
      updatedAt: '2025-05-06T10:00:00-04:00',
      imagens: [
        {
          id: 'img-1001-1',
          url: productImage1.src,
          posicao: 1,
        },
        {
          id: 'img-1001-2',
          url: productImage1_1.src,
          posicao: 2,
        },
        {
          id: 'img-1001-3',
          url: productImage1_2.src,
          posicao: 3,
        },
        {
          id: 'img-1001-4',
          url: productImage1_3.src,
          posicao: 4,
        },
      ],
    },
    {
      id: 'gid://1002',
      lojaId: 'loja-001',
      titulo: 'Silk Midi Dress',
      descricao:
        'Elegant midi dress made from 100% mulberry silk. Flowy silhouette with a subtle sheen.',
      categoriaId: 'cat-dresses',
      preco: 120,
      marca: 'ChicElegance',
      modelo: 'SMD-2025',
      condicao: 'Novo',
      quantidadeEstoque: 85,
      quantidadeMinima: 3,
      permitePedidoSemEstoque: true,
      sku: 'SMD-2025-EMR',
      codigoBarras: '987654321002',
      ativo: true,
      createdAt: '2025-05-07T09:30:00-04:00',
      updatedAt: '2025-05-07T09:30:00-04:00',
      imagens: [
        { id: 'img-1002-1', url: productImage2.src, posicao: 1 },
        { id: 'img-1002-2', url: productImage2_1.src, posicao: 2 },
        { id: 'img-1002-3', url: productImage2_2.src, posicao: 3 },
        { id: 'img-1002-4', url: productImage2_3.src, posicao: 4 },
      ],
    },
    {
      id: 'gid://1003',
      lojaId: 'loja-001',
      titulo: 'Denim Jacket',
      descricao:
        'Classic denim jacket with a relaxed fit. Features distressed details and button-front closure.',
      categoriaId: 'cat-jackets',
      preco: 65,
      marca: 'UrbanTrend',
      modelo: 'DJ-2025',
      condicao: 'Novo',
      quantidadeEstoque: 200,
      quantidadeMinima: 10,
      permitePedidoSemEstoque: false,
      sku: 'DJ-2025-LBL',
      codigoBarras: '987654321003',
      ativo: true,
      createdAt: '2025-05-08T11:15:00-04:00',
      updatedAt: '2025-05-08T11:15:00-04:00',
      imagens: [
        { id: 'img-1003-1', url: productImage3.src, posicao: 1 },
        { id: 'img-1003-2', url: productImage3_1.src, posicao: 2 },
        { id: 'img-1003-3', url: productImage3_2.src, posicao: 3 },
        { id: 'img-1003-4', url: productImage3_3.src, posicao: 4 },
      ],
    },
    {
      id: 'gid://1004',
      lojaId: 'loja-001',
      titulo: 'Cashmere Sweater',
      descricao:
        'Ultra-soft cashmere sweater with a crew neck. Perfect layering piece for colder days.',
      categoriaId: 'cat-sweaters',
      preco: 150,
      precoOriginal: 180,
      marca: 'SoftLux',
      modelo: 'CS-2025',
      condicao: 'Novo',
      quantidadeEstoque: 60,
      quantidadeMinima: 2,
      permitePedidoSemEstoque: true,
      sku: 'CS-2025-CRM',
      codigoBarras: '987654321004',
      ativo: true,
      createdAt: '2025-05-09T14:20:00-04:00',
      updatedAt: '2025-05-09T14:20:00-04:00',
      imagens: [
        { id: 'img-1004-1', url: productImage4.src, posicao: 1 },
        { id: 'img-1004-2', url: productImage4_1.src, posicao: 2 },
        { id: 'img-1004-3', url: productImage4_2.src, posicao: 3 },
        { id: 'img-1004-4', url: productImage4_3.src, posicao: 4 },
      ],
    },
    {
      id: 'gid://1005',
      lojaId: 'loja-001',
      titulo: 'Linen Blazer',
      descricao:
        'Breathable linen blazer with a tailored fit. Ideal for smart-casual occasions.',
      categoriaId: 'cat-blazers',
      preco: 95,
      marca: 'TailoredFit',
      modelo: 'LB-2025',
      condicao: 'Novo',
      quantidadeEstoque: 90,
      quantidadeMinima: 5,
      permitePedidoSemEstoque: false,
      sku: 'LB-2025-BGE',
      codigoBarras: '987654321005',
      ativo: true,
      createdAt: '2025-05-10T08:45:00-04:00',
      updatedAt: '2025-05-10T08:45:00-04:00',
      imagens: [
        { id: 'img-1005-1', url: productImage5.src, posicao: 1 },
        { id: 'img-1005-2', url: productImage5_1.src, posicao: 2 },
        { id: 'img-1005-3', url: productImage5_2.src, posicao: 3 },
        { id: 'img-1005-4', url: productImage5_3.src, posicao: 4 },
      ],
    },
    {
      id: 'gid://1006',
      lojaId: 'loja-001',
      titulo: 'Velvet Skirt',
      descricao:
        'Luxurious velvet midi skirt with an elastic waistband. Adds a touch of glamour to any outfit.',
      categoriaId: 'cat-skirts',
      preco: 55,
      marca: 'GlamVibe',
      modelo: 'VS-2025',
      condicao: 'Novo',
      quantidadeEstoque: 110,
      quantidadeMinima: 4,
      permitePedidoSemEstoque: true,
      sku: 'VS-2025-WIN',
      codigoBarras: '987654321006',
      ativo: true,
      createdAt: '2025-05-11T12:10:00-04:00',
      updatedAt: '2025-05-11T12:10:00-04:00',
      imagens: [
        { id: 'img-1006-1', url: productImage6.src, posicao: 1 },
        { id: 'img-1006-2', url: productImage6_1.src, posicao: 2 },
        { id: 'img-1006-3', url: productImage6_2.src, posicao: 3 },
        { id: 'img-1006-4', url: productImage6_3.src, posicao: 4 },
      ],
    },
    {
      id: 'gid://1007',
      lojaId: 'loja-001',
      titulo: 'Wool Trench Coat',
      descricao:
        'Timeless wool trench coat with a belted waist and storm flap. Keeps you warm and stylish.',
      categoriaId: 'cat-coats',
      preco: 180,
      marca: 'ClassicCharm',
      modelo: 'WTC-2025',
      condicao: 'Novo',
      quantidadeEstoque: 45,
      quantidadeMinima: 1,
      permitePedidoSemEstoque: false,
      sku: 'WTC-2025-CAM',
      codigoBarras: '987654321007',
      ativo: true,
      createdAt: '2025-05-12T10:25:00-04:00',
      updatedAt: '2025-05-12T10:25:00-04:00',
      imagens: [
        { id: 'img-1007-1', url: productImage7.src, posicao: 1 },
        { id: 'img-1007-2', url: productImage7_1.src, posicao: 2 },
        { id: 'img-1007-3', url: productImage7_2.src, posicao: 3 },
        { id: 'img-1007-4', url: productImage7_3.src, posicao: 4 },
      ],
    },
    {
      id: 'gid://1008',
      lojaId: 'loja-001',
      titulo: 'Cotton Shirt',
      descricao:
        'Crisp cotton button-down shirt. Versatile piece for both casual and formal looks.',
      categoriaId: 'cat-shirts',
      preco: 45,
      marca: 'CasualVibe',
      modelo: 'CSH-2025',
      condicao: 'Novo',
      quantidadeEstoque: 300,
      quantidadeMinima: 15,
      permitePedidoSemEstoque: true,
      sku: 'CSH-2025-WHT',
      codigoBarras: '987654321008',
      ativo: true,
      createdAt: '2025-05-13T09:00:00-04:00',
      updatedAt: '2025-05-13T09:00:00-04:00',
      imagens: [
        { id: 'img-1008-1', url: productImage8.src, posicao: 1 },
        { id: 'img-1008-2', url: productImage8_1.src, posicao: 2 },
        { id: 'img-1008-3', url: productImage8_2.src, posicao: 3 },
        { id: 'img-1008-4', url: productImage8_3.src, posicao: 4 },
      ],
    },
  ];
}




export async function getProductByHandle(id: string): Promise<Product> {

  const normalised = id

  const products = await getProducts();

  let product = products.find((p) => p.id === normalised);

  if (!product) {
    product = products[0]!;
  }

  return product;
}

export async function getProductDetailByHandle(
  handle: string
): Promise<
  Product & {
    status: string;
    breadcrumbs: { id: number; name: string; href: string }[];
    description: string;
    publishedAt: string;
    features: string[];
    careInstruction: string;
    shippingAndReturn: string;
  }
> {
  const normalised = handle.toLowerCase();
  const product = await getProductByHandle(normalised);

  const detail = {
    status: 'In Stock',
    breadcrumbs: [
      { id: 1, name: 'Home', href: '/' },
      {
        id: 2,
        name: product.categoriaId
          .replace('cat-', '')
          .replace('-', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        href: `/collections/${product.categoriaId}`,
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    publishedAt: '2019-03-27T17:43:25Z',
    features: [
      'Material: 43% Sorona Yarn + 57% Stretch Polyester',
      'Casual pants waist with elastic elastic inside',
      'The pants are a bit tight so you always feel comfortable',
      'Excool technology application 4-way stretch',
    ],
    careInstruction:
      'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron low if needed. Do not dry clean.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  };

  return { ...product, ...detail };
}
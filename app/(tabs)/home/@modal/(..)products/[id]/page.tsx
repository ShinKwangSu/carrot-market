import CloseBtn from "@/components/close-btn";
import db from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getProductDetail(id: number) {
  const product = await db.product.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  if (product) {
    return product;
  }
}

export default async function Modal({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getProductDetail(id);
  if (!product) {
    return notFound();
  }

  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60 left-0 top-0">
      <CloseBtn />
      <div className="max-w-screen-sm h-1/2 flex justify-center w-full">
        <div className="relative w-4/5 h-4/5 flex rounded-md overflow-hidden bg-neutral-600 opacity-95 *:p-2">
          {/* 이미지 영역 */}
          <div className="flex-1 relative overflow-hidden">
            <div className="relative w-full h-full aspect-[4/3]">
              {" "}
              {/* 비율 강제 */}
              <Image
                src={product.photo}
                alt={product.title}
                layout="fill"
                objectFit="contain" // 이미지가 컨테이너에 맞게 작아짐
                objectPosition="center" // 중앙 정렬
              />
            </div>
          </div>
          {/* 텍스트 영역 */}
          <div className="w-2/5 bg-neutral-600 flex flex-col justify-center text-white">
            <h2 className="text-lg font-bold mb-2">{product.title}</h2>
            <p className="text-sm">{product.description}</p>
            <span className="mt-10">
              {new Date(product.created_at).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

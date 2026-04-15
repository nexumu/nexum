import cloudinary from "@/lib/cloudinary/server";

export const runtime = "nodejs";

type UploadResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  width: number;
  height: number;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(
      formData.get("folder") ||
        process.env.CLOUDINARY_PRODUCTS_FOLDER ||
        "products"
    );

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Archivo inválido." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "Solo se permiten imágenes." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Compresion estandar + limites razonables para ecommerce.
          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
              width: 1600,
              height: 1600,
              crop: "limit",
            },
          ],
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve(uploadResult as UploadResult);
        }
      );

      stream.end(buffer);
    });

    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}

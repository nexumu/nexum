import cloudinary from "@/lib/cloudinary/server";

export const runtime = "nodejs";

type DeletePayload = {
  publicId?: string;
  publicIds?: string[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DeletePayload;
    const publicIds = Array.from(
      new Set(
        [payload.publicId, ...(payload.publicIds ?? [])]
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
      )
    );

    if (publicIds.length === 0) {
      return Response.json({ error: "No se enviaron publicIds." }, { status: 400 });
    }

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image",
      type: "upload",
    });

    return Response.json({ result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "No se pudieron eliminar las imágenes." },
      { status: 500 }
    );
  }
}

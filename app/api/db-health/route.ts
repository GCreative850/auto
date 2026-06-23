import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;

    return Response.json({
      ok: true,
      app: "AutoHQ",
      database: "connected",
      time: result[0]?.now ?? null
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        app: "AutoHQ",
        database: "error",
        message: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}

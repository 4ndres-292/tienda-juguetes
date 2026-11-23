
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { status: "error", message: "Faltan variables de entorno" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, key);

    const { count, error } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Supabase:", error.message);

      return NextResponse.json(
        { status: "error", message: "No se pudo consultar categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión con Supabase exitosa",
      database: "PostgreSQL",
      categories: count
    });
  } catch (error) {
    console.error("Error de conexión:", error);

    return NextResponse.json(
      { status: "error", message: "Error de conexión" },
      { status: 500 }
    );
  }
}

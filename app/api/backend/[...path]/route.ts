const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const BLOG_API_KEY = process.env.BLOG_API_KEY;
const BLOG_PROJECT_SLUG = process.env.BLOG_PROJECT_SLUG;

async function proxy(request: Request, paramsPromise: Promise<any>) {
  const params = await paramsPromise;
  const pathString = Array.isArray(params.path) ? params.path.join("/") : params.path;

  if (!BACKEND_BASE_URL) {
    return new Response(JSON.stringify({ error: "Missing BACKEND_BASE_URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const targetUrl = `${BACKEND_BASE_URL}/${pathString}/${url.search}`;

  const isBodyless = ["GET", "HEAD"].includes(request.method);
  const body = isBodyless ? undefined : await request.arrayBuffer();
  const contentType = request.headers.get("content-type");

  const forwardHeaders: Record<string, string> = {
    "Authorization": `Api-Key ${BLOG_API_KEY}`,
    "X-Api-Key": `${BLOG_API_KEY}`,
    "Api-Key": `${BLOG_API_KEY}`,
    ...(contentType ? { "Content-Type": contentType } : { "Content-Type": "application/json" }),
  };

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
      redirect: "follow",
    });

    console.log(`[Proxy] Backend responded with status: ${response.status}`);
    const responseBody = response.status === 204 ? null : await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: any) {
    console.error(`[Proxy Error] Failed to reach ${targetUrl}:`, error.message);
    return new Response(
      JSON.stringify({
        error: "Backend Unreachable",
        details: error.message,
        target: targetUrl,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request: Request, { params }: { params: Promise<any> }) {
  return proxy(request, params);
}

export async function POST(request: Request, { params }: { params: Promise<any> }) {
  return proxy(request, params);
}

export async function PUT(request: Request, { params }: { params: Promise<any> }) {
  return proxy(request, params);
}

export async function PATCH(request: Request, { params }: { params: Promise<any> }) {
  return proxy(request, params);
}

export async function DELETE(request: Request, { params }: { params: Promise<any> }) {
  return proxy(request, params);
}

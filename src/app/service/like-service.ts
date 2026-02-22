
export const reactNews = async (
  type: "like" | "dislike",
  params: { slug: string }
) => {
  const slug = params.slug;
  const res = await fetch(`/api/news/${slug}/reaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  const data = await res.json();

  if (!res.ok)
    throw {
      message: data.message,
      status: data.status,
    };
  return data;
};

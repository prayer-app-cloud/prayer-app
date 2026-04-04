interface UpdateProps {
  params: Promise<{ id: string }>;
}

export default async function UpdatePrayer({ params }: UpdateProps) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Update your prayer
      </h1>
      <p className="text-warm-gray">Update form for {id}</p>
    </main>
  );
}

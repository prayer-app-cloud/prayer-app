interface PrayerDetailProps {
  params: Promise<{ share_slug: string }>;
}

export default async function PrayerDetail({ params }: PrayerDetailProps) {
  const { share_slug } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Someone needs prayer
      </h1>
      <p className="text-warm-gray">Prayer detail for {share_slug}</p>
    </main>
  );
}

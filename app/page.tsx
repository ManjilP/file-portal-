import ModelForm, { ModelField } from '@/components/ModelForm';

async function getFields(): Promise<ModelField[]> {
  const res = await fetch(
    `${process.env.BACKEND_BASE_URL}/custom-model-fields/?custom_model=52`,
    {
      headers: { 'X-Api-Key': process.env.BLOG_API_KEY! },
      cache: 'no-store',
    }
  );
  const json = await res.json();
  return json.data ?? [];
}

export default async function Home() {
  const fields = await getFields();

  return (
    <div className="page container">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 8 }}>File Submission</h1>
        <p style={{ textAlign: 'center', marginBottom: 32 }}>Fill in the form below</p>
        <div className="card">
          <ModelForm modelId={52} fields={fields} />
        </div>
      </div>
    </div>
  );
}

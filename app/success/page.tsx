import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="page container">
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: 64, marginBottom: 24 }}>✅</p>
        <h1 style={{ marginBottom: 12 }}>Submitted successfully</h1>
        <p style={{ marginBottom: 32 }}>Your file submission has been received.</p>
        <Link href="/" className="btn btn-primary">
          Submit another
        </Link>
      </div>
    </div>
  );
}

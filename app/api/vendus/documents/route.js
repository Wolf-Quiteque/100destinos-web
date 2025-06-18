import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const vendusApiKey = process.env.VENDUS_API_KEY;
    if (!vendusApiKey) {
      return NextResponse.json({ error: 'VENDUS_API_KEY not configured' }, { status: 500 });
    }

    const body = await request.json();

    const vendusDocumentResponse = await fetch('https://www.vendus.co.ao/ws/v1.1/documents/?api_key=dec67e797cc4e8f753604bb180f9352e', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });

    if (!vendusDocumentResponse.ok) {
      const errorData = await vendusDocumentResponse.json();
      console.error('Error from Vendus API (documents):', errorData);
      return NextResponse.json({ error: 'Failed to create document in Vendus', details: errorData }, { status: vendusDocumentResponse.status });
    }

    const vendusDocument = await vendusDocumentResponse.json();
    return NextResponse.json(vendusDocument, { status: 200 });

  } catch (error) {
    console.error('API route error (documents):', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

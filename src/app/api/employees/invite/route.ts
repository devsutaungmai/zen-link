import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`Sending invite to ${email}`);

    return NextResponse.json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
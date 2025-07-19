import { NextRequest, NextResponse } from 'next/server';
import {search} from "@/services/video";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const maxResults = parseInt(searchParams.get('maxResults') || '10', 10);

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const data = await search({ query, maxResults });
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Failed to index videos' }, { status: 500 });
    }
}
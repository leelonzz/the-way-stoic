import {draftMode} from 'next/headers'
import {NextRequest} from 'next/server'

export async function GET(request: NextRequest) {
  draftMode().disable()
  
  return new Response('Draft mode disabled', {status: 200})
}
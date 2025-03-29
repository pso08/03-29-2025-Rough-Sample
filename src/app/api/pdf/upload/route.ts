// app/api/pdf/upload/route.ts
import { processPdf } from '@/lib/pdf-parser';

export const dynamic = 'force-dynamic'; // Ensure this route is dynamically rendered

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file) {
      return new Response('No file uploaded', { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return new Response('Invalid file type. Please upload a PDF file.', { status: 400 });
    }

    // Validate file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return new Response('File too large. Maximum size is 5MB.', { status: 400 });
    }

    // Process the PDF
    const questions = await processPdf(file);
    
    return Response.json({
      success: true,
      data: questions,
      message: 'PDF processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error processing PDF',
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * GET endpoint to serve the sample PDF
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'AWSCertifiedDevOpsEngineer-Sample', 'sample.pdf');
    const file = await fs.readFile(filePath);
    
    return new Response(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="AWSCertifiedDevOpsEngineer-Sample.pdf"'
      }
    });
  } catch (error) {
    console.error('Error serving sample PDF:', error);
    return new Response('Sample PDF not found', { status: 404 });
  }
}
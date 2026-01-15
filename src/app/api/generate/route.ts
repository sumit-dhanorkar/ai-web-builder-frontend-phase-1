import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract business info and website config from the request
    const { business_info, website_config } = body
    
    // Validate required fields
    if (!business_info?.company_name || !business_info?.company_type) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: company_name and company_type' 
        },
        { status: 400 }
      )
    }
    
    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please login first.'
        },
        { status: 401 }
      )
    }

    console.log(`Making request to: ${backendUrl}/api/jobs/generate`)

    try {
      const response = await fetch(`${backendUrl}/api/jobs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader, // Forward auth token
        },
        body: JSON.stringify({
          business_info,
          website_config
        }),
        // Add timeout
        signal: AbortSignal.timeout(300000) // 5 minutes timeout
      })
      
      if (!response.ok) {
        let errorMessage = 'Failed to generate website'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
        } catch {
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }
        
        console.error('Backend error:', errorMessage)
        return NextResponse.json(
          { 
            success: false,
            error: errorMessage
          },
          { status: response.status }
        )
      }
      
      const result = await response.json()
      
      // Return success response
      return NextResponse.json({
        success: result.success || true,
        project_name: result.project_name,
        project_path: result.project_path,
        download_url: result.download_url,
        preview_url: result.preview_url,
        message: result.message || 'Website generated successfully!'
      })
      
    } catch (fetchError: any) {
      console.error('Network error:', fetchError)
      
      // Handle specific error types
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Request timeout. Website generation is taking longer than expected.'
          },
          { status: 408 }
        )
      }
      
      if (fetchError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Backend server is not running. Please start the Python backend server.'
          },
          { status: 503 }
        )
      }
      
      throw fetchError // Re-throw for general error handling
    }
    
  } catch (error: any) {
    console.error('API Error:', error)
    
    // For development, check if we should return a mock response
    const useMock = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_API === 'true'
    
    if (useMock) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return NextResponse.json({
        success: true,
        project_name: `mock-${Date.now()}`,
        project_path: '/mock/path',
        download_url: '/api/download/mock-project.zip',
        preview_url: '/api/preview/mock-project',
        message: 'Website generated successfully! (Mock response for development)'
      })
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
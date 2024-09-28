"use client"

import { useState, ChangeEvent } from "react"
import { useRouter } from "next/navigation";
import axios from 'axios'

interface PostImageResponse {
  error_codes: number[];
  threshold?: number;
  classification?: string;
}

const API_URL = 'http://localhost:8000'

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<PostImageResponse | null>(null)
  const router = useRouter();
  
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
      
    if (file) {
      setImage(file)
      try {
        const formData = new FormData()
        formData.append("file", file)
        const postResponse = await axios.post<PostImageResponse>(`${API_URL}/post_image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log(postResponse);
        
        const file_path = file.name
        router.push(`/result?${file_path}`);
  
        if (postResponse.data.error_codes.length === 0) {
          setAnalysis(postResponse.data); // 分析結果を状態に設定
          const file_path = file.name
          router.push(`/result?${file_path}`);
        } else {
          console.error("Error uploading image:", postResponse.data.error_codes)
        }
      } catch (error) {
        console.error("Error handling image upload:", error)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 md:p-10">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Trash Analyzer</h1>
          <p className="text-muted-foreground">Upload an image and let our AI system analyze it.</p>
        </div>
        <div className="grid gap-4">
          <div className="flex justify-center">
            {image ? (
              <img
                src="/next.svg"
                alt="Uploaded Image"
                width={400}
                height={400}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-muted rounded-lg">
                <span className="text-muted-foreground">Drop your image here or click to upload</span>
              </div>
            )}
          </div>
          <div>
            <input type="file" id="image-upload" className="sr-only" onChange={handleImageUpload} />
            <label
              htmlFor="image-upload"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Upload Image
            </label>
          </div>
          {analysis && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Image Analysis</h2>
                <p className="text-muted-foreground">
                  Our AI system has analyzed your image and provided the following insights:
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Threshold:</span>
                  <span>{analysis.threshold !== undefined ? analysis.threshold : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Classification:</span>
                  <span>{analysis.classification || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

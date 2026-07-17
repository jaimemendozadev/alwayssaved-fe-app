'use client';
import { useEffect,} from 'react';
import { useRouter } from 'next/navigation';
import {
  Show,
  SignUpButton,
  SignOutButton,
  useUser
} from '@clerk/nextjs';

export default function LandingPage() {
  const router = useRouter();

  const { isSignedIn } = useUser()


  if(isSignedIn) {
    router.push('/home')
  }

  useEffect(() => {

    if(isSignedIn) {
      router.push('/home')
    }

  }, [isSignedIn, router])


  

  return (
    <div className="max-w-[90%] mx-auto p-28">
      <nav className="max-w-[90%] m-auto mb-36 flex justify-end">
        <Show when="signed-in">
          <SignOutButton>
            <button className="border-2 py-3 px-6 rounded-sm">Sign Out</button>
          </SignOutButton>
        </Show>

        <Show when="signed-out">
          <SignUpButton>
            <button className="border-2 py-3 px-6 rounded-sm">
              Sign Up &#47; Sign In
            </button>
          </SignUpButton>
        </Show>
      </nav>
      <section className="mb-16">
        <h1 className="text-4xl font-medium mb-10">
          🧠 AlwaysSaved - Your Private, Searchable Knowledge Base for Your Info
        </h1>
        <p className="text-lg mb-4">
          Most of your best ideas are locked inside video, audio files, or other
          media you&apos;ll never consume.
        </p>

        <p className="text-lg">
          AlwaysSaved transforms long-form content - podcasts, Zoom calls,
          lectures, interviews, YouTube videos, and more - into instantly
          searchable, AI-understandable knowledge. Upload once, ask questions
          forever.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-medium mb-4">⚡ Why AlwaysSaved?</h2>

        <p className="text-lg mb-4">
          Because information should never be lost in a 90-minute content file.
        </p>
        <p className="text-lg">
          AlwaysSaved turns your media library into a second brain.
        </p>
      </section>

      <section className="mb-16">
        <h3 className="text-2xl font-medium mb-4">🔍 What It Does</h3>

        <p className="text-lg mb-4">
          AlwaysSaved turns your personal video and audio files into smart,
          searchable documents using advanced AI models — no manual note-taking,
          no rewatching.
        </p>

        <ul>
          <li className="text-lg mb-4">
            🧬 Transcribes speech to accurate, readable text using Whisper
          </li>
          <li className="text-lg mb-4">
            🧷 Indexes everything in a vector database (Qdrant) for fast
            semantic search
          </li>
          <li className="text-lg mb-4">
            ❓ Answers natural language questions about your content using
            Retrieval-Augmented Generation (RAG)
          </li>
        </ul>
      </section>

      <section>
        <h4 className="text-2xl font-medium mb-4">✨ Key Features</h4>

        <ul>
          <li className="text-lg mb-4">
            <i>Drag-and-Drop Simplicity</i>
            <br />
            Upload a video or audio file and let the AI handle the rest.
          </li>

          <li className="text-lg mb-4">
            <i>Private Semantic Search</i>
            <br />
            Search your files like Google - but faster, smarter, and fully
            private.
          </li>

          <li className="text-lg mb-4">
            <i>Ask Anything</i>
            <br />
            &lsquo;What did the speaker say about market trends?&rsquo; - and
            get the exact answer, sourced from your content.
          </li>

          <li className="text-lg mb-4">
            <i>Multilingual Support</i>
            <br />
            Works with English, Spanish, and other supported languages.
          </li>

          <li className="text-lg mb-4">
            <i>Lightning-Fast GPU Processing</i>
            <br />
            Powered by NVIDIA hardware in the cloud for speedy results.
          </li>
        </ul>
      </section>
    </div>
  );
}

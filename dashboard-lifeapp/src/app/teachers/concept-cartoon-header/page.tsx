'use client'
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconSearch, IconBell, IconSettings, IconEdit, IconTrash } from '@tabler/icons-react';
import { Plus, Search, XCircle } from "lucide-react";

// const poppins = Poppins({
//     subsets: ['latin'],
//     weight: ['400', '600', '700'],
//     variable: '--font-poppins',
// });
type Header = {
    id: number
    heading: string
    description: string
    button_one_text: string
    button_one_link: string
    button_two_text: string
    button_two_link: string
    media_url?: string
    created_at: string
    updated_at: string
  }
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'
// const api_startpoint = 'http://152.42.239.141:5000'
export default function ConceptCartoonForm() {
    const empty = {
        heading: '',
        description: '',
        button_one_text: '',
        button_one_link: '',
        button_two_text: '',
        button_two_link: ''
    }
      const [form, setForm]           = useState(empty)
      const [file, setFile]           = useState<File | null>(null)
      const fileInputRef = useRef<HTMLInputElement | null>(null)
      const [headers, setHeaders]     = useState<Header[]>([])
      const [editing, setEditing]     = useState<Header | null>(null)
      const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [loadingList, setLoadingList] = useState(true)

      // utility to normalize API response
    const normalize = (data: any): Header[] => {
        if (Array.isArray(data)) return data
        if (data.headers && Array.isArray(data.headers)) return data.headers
        if (data.rows && Array.isArray(data.rows)) return data.rows
        console.warn('Unexpected data format:', data)
        return []
    }
      // fetch list
    useEffect(() => {
        ;(async () => {
        setLoadingList(true)
        try {
            const res = await fetch(`${api_startpoint}/api/concept-cartoon-headers`)
            const data = await res.json()
            setHeaders(normalize(data))
        } catch (err) {
            console.error('Error fetching headers:', err)
        } finally {
            setLoadingList(false)
          }
        })()
    }, [])
    
      // text inputs
      const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))
      }
      // file input
      const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null)
      }
    
      // convert YouTube URL → embed URL
      const getEmbed = (url: string) => {
        const m = url.match(/[?&]v=([^&]+)/)
        if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1`
        if (url.includes('youtu.be/')) {
          const id = url.split('youtu.be/')[1].split(/[?&]/)[0]
          return `https://www.youtube.com/embed/${id}?autoplay=1`
        }
        return url
      }
    
      // submit create or update
      const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v as string))
        if (file) fd.append('media', file)
    
        const url = editing ? `${api_startpoint}/api/concept-cartoon-headers/${editing.id}` : `${api_startpoint}/api/concept-cartoon-headers`
        const method = editing ? 'PUT' : 'POST'
        try {
            const res = await fetch(url, { method, body: fd })
            if (res.ok) {
            const updated = await fetch(`${api_startpoint}/api/concept-cartoon-headers`).then(r => r.json())
            setHeaders(normalize(updated))
            reset()
            } else {
            console.error(await res.json())
            }
        } catch (err) {
        console.error('Submission error:', err)
        } finally {
            setIsSubmitting(false)
        }
      }
    
      const reset = () => {
        setForm(empty)
        setFile(null)
        setEditing(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
      }
    
      const onEdit = (h: Header) => {
        setEditing(h)
        setForm({
          heading: h.heading,
          description: h.description,
          button_one_text: h.button_one_text,
          button_one_link: h.button_one_link,
          button_two_text: h.button_two_text,
          button_two_link: h.button_two_link
        })
      }
    
      const onDelete = async (h: Header) => {
        if (!confirm(`Delete "${h.heading}"?`)) return
        const res = await fetch(`${api_startpoint}/api/concept-cartoon-headers/${h.id}`, { method: 'DELETE' })
        setLoadingList(true)
        if (res.ok) {setHeaders(headers.filter(x => x.id !== h.id)); setLoadingList(false);}
        else console.error(await res.json())
      }

    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className='page-body'>
                    <div className="container-xl pt-0 pb-4">
                        {/* ─── Form ───────────────────────────────────── */}
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                            <h5 className="mb-3">{editing ? 'Edit' : 'Create'} Concept Cartoon</h5>
                            <form onSubmit={onSubmit}>
                                <input
                                name="heading"
                                value={form.heading}
                                onChange={onChange}
                                className="form-control mb-3"
                                placeholder="Heading"
                                required
                                />
                                <textarea
                                name="description"
                                value={form.description}
                                onChange={onChange}
                                className="form-control mb-3"
                                placeholder="Description"
                                rows={4}
                                required
                                />
                                <div className="row mb-3">
                                <div className="col">
                                    <input
                                    name="button_one_text"
                                    value={form.button_one_text}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Button One Text (BLOG)"
                                    required
                                    />
                                </div>
                                <div className="col">
                                    <input
                                    name="button_one_link"
                                    value={form.button_one_link}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Button One Link (BLOG)"
                                    required
                                    />
                                </div>
                                </div>
                                <div className="row mb-3">
                                <div className="col">
                                    <input
                                    name="button_two_text"
                                    value={form.button_two_text}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Button Two Text (VIDEO)"
                                    required
                                    />
                                </div>
                                <div className="col">
                                    <input
                                    name="button_two_link"
                                    value={form.button_two_link}
                                    onChange={onChange}
                                    className="form-control"
                                    placeholder="Button Two Link (VIDEO)"
                                    required
                                    />
                                </div>
                                </div>
                                <div className="mb-3">
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex items-center"
                                    disabled={isSubmitting}
                                    >
                                    {isSubmitting && (
                                        <div className="animate-spin border-t-2 border-white rounded-full w-4 h-4 mr-2"></div>
                                    )}
                                    {editing
                                        ? isSubmitting ? 'Saving...' : 'Save Changes'
                                        : isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                {editing && (
                                <button type="button" className="ml-2 btn btn-secondary" onClick={reset}>
                                    Cancel
                                </button>
                                )}
                            </form>
                            </div>
                        </div>

                        {/* ─── Table ──────────────────────────────────── */}
                        <div className="card shadow-sm">
                            <div className="card-body overflow-auto">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Heading</th>
                                    <th>Description</th>
                                    <th>Btn 1 Text / Link</th>
                                    <th>Btn 2 Text / Link</th>
                                    <th>Media</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loadingList
                                ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-8">
                                    <div className="animate-spin border-t-2 border-blue-500 rounded-full w-8 h-8 mx-auto"></div>
                                    </td>
                                </tr>
                                ) : (
                                headers.map(h => (
                                    <tr key={h.id}>
                                    <td>{h.id}</td>
                                    <td>{h.heading}</td>
                                    <td>{h.description}</td>
                                    <td>
                                        {h.button_one_text}{' '}
                                        <button
                                        className="btn btn-sm btn-link p-0"
                                        onClick={() => setLightboxUrl(h.button_one_link)}
                                        >
                                        🔗
                                        </button>
                                    </td>
                                    <td>
                                        {h.button_two_text}{' '}
                                        <button
                                        className="btn btn-sm btn-link p-0"
                                        onClick={() => setLightboxUrl(h.button_two_link)}
                                        >
                                        🔗
                                        </button>
                                    </td>
                                    <td>
                                        {h.media_url ? (
                                        <img
                                            src={h.media_url}
                                            alt=""
                                            className="w-12 h-12 object-cover cursor-pointer"
                                            onClick={() => setLightboxUrl(h.media_url!)}
                                        />
                                        ) : (
                                        '—'
                                        )}
                                    </td>
                                    <td>{h.created_at}</td>
                                    <td>{h.updated_at}</td>
                                    <td>
                                        <button
                                        className="btn btn-sm btn-secondary me-2"
                                        onClick={() => onEdit(h)}
                                        >
                                        <IconEdit size={16} />
                                        </button>
                                        <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => onDelete(h)}
                                        >
                                        <IconTrash size={16} />
                                        </button>
                                    </td>
                                    </tr>
                                    ))
                                    )
                                }
                                </tbody>
                            </table>
                            </div>
                        </div>

                        {/* ─── Lightbox ──────────────────────────────── */}
                        {lightboxUrl && (
                            <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                            onClick={() => setLightboxUrl(null)}
                            >
                            <div className="relative">
                                {/\.(jpe?g|png|gif)$/i.test(lightboxUrl) ? (
                                <img
                                    src={lightboxUrl}
                                    alt="Preview"
                                    className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                                />
                                ) : (
                                <iframe
                                    src={getEmbed(lightboxUrl)}
                                    title="Video Preview"
                                    className="max-w-[90vw] max-h-[90vh] w-[80vh] h-[80vh] rounded-lg shadow-lg"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                )}
                                <button
                                className="absolute top-2 right-2 text-white bg-gray-900 rounded-full p-1"
                                onClick={e => {
                                    e.stopPropagation()
                                    setLightboxUrl(null)
                                }}
                                >
                                <XCircle size={24} />
                                </button>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
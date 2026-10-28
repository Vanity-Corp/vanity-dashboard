import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, ImageUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { mediaService } from '@/services/media.service'
import { ApiError, API_URL } from '@/lib/api-client'
import { cn } from '@/lib/utils'

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

function Btn({
  active, onClick, children, title,
}: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded hover:bg-accent',
        active && 'bg-accent text-accent-foreground',
      )}
    >
      {children}
    </button>
  )
}

interface RichTextFieldProps {
  value: string
  onChange: (html: string) => void
}

// Tiptap-based rich text editor, controlled via plain HTML string value/onChange
// so it composes the same way as every other field in these forms (or via
// react-hook-form's <Controller> where a form uses RHF). Used for Article
// content and richSection block bodies.
export function RichTextField({ value, onChange }: RichTextFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, HTMLAttributes: { class: 'rounded-md' } }),
    ],
    content: value || '',
    immediatelyRender: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-40 p-3 focus:outline-none dark:prose-invert',
      },
    },
  })

  if (!editor) return null

  const uploadImage = async (file: File) => {
    try {
      const media = await mediaService.upload(file)
      editor.chain().focus().setImage({ src: mediaUrl(media.url) }).run()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Échec de l'envoi de l'image.")
    }
  }

  return (
    <div className="rounded-md border">
      <div className="flex items-center gap-1 border-b p-1">
        <Btn title="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn title="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          title="Titre 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          title="Titre 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Btn>
        <Btn title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn title="Insérer une image" onClick={() => fileRef.current?.click()}>
          <ImageUp className="h-4 w-4" />
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/webp,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void uploadImage(file)
            e.target.value = ''
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

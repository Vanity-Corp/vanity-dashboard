import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { articlesService } from '@/services/articles.service'
import { PERMISSIONS } from '@/lib/permissions'
import { slugify } from '@/lib/utils'
import type { Article, ArticleStatus } from '@/types'

interface ArticleForm {
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string
  // Markdown — rendered on corp-site with Next.js's native remark/rehype
  // pipeline. Plain textarea on purpose, no WYSIWYG/HTML output here.
  content: string
  status: ArticleStatus
  // Undefined (not ''), so JSON.stringify drops the key entirely rather
  // than sending an empty string into the backend's z.coerce.date().
  publishedAt: string | undefined
  seoMetaTitle: string
  seoMetaDescription: string
  seoOgImageUrl: string
}

const emptyForm: ArticleForm = {
  title: '', slug: '', excerpt: '', coverImageUrl: '', content: '', status: 'DRAFT',
  publishedAt: undefined, seoMetaTitle: '', seoMetaDescription: '', seoOgImageUrl: '',
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ArticlesPage() {
  return (
    <ResourceCrudPage<Article, ArticleForm>
      title="Articles"
      description="Articles de blog / actualités de l'agence."
      queryKey="articles"
      service={articlesService}
      readPermission={PERMISSIONS.articlesRead}
      writePermission={PERMISSIONS.articlesWrite}
      createLabel="Nouvel article"
      dialogClassName="w-[80vw] sm:max-w-[80vw] max-h-[88vh] overflow-y-auto"
      searchPlaceholder="Rechercher un article…"
      searchFields={(a) => [a.slug, a.excerpt ?? '']}
      emptyForm={emptyForm}
      isFormValid={(f) => !!f.title.trim() && !!f.slug.trim()}
      getRowName={(a) => a.title}
      toFormState={(a) => ({
        title: a.title, slug: a.slug, excerpt: a.excerpt ?? '', coverImageUrl: a.coverImageUrl ?? '',
        content: a.content ?? '', status: a.status,
        publishedAt: a.publishedAt ? a.publishedAt.slice(0, 10) : undefined,
        seoMetaTitle: a.seoMetaTitle ?? '', seoMetaDescription: a.seoMetaDescription ?? '',
        seoOgImageUrl: a.seoOgImageUrl ?? '',
      })}
      columns={[
        { header: 'Titre', render: (a) => <span className="font-medium">{a.title}</span> },
        {
          header: 'Statut',
          render: (a) => (
            <Badge variant={a.status === 'PUBLISHED' ? 'default' : 'outline'}>
              {a.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
            </Badge>
          ),
        },
      ]}
      renderForm={(form, setForm) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm({ ...form, title, slug: form.slug || slugify(title) })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Extrait</Label>
            <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <ImageUploadField
            label="Image de couverture"
            value={form.coverImageUrl}
            onChange={(coverImageUrl) => setForm({ ...form, coverImageUrl })}
          />
          <div className="space-y-2">
            <Label>Contenu (Markdown)</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-56 font-mono text-sm"
              placeholder="## Titre&#10;&#10;Texte en **markdown**…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.status}
                onValueChange={(v) => {
                  const status = v as ArticleStatus
                  setForm({
                    ...form,
                    status,
                    publishedAt: status === 'PUBLISHED' ? (form.publishedAt ?? todayIsoDate()) : form.publishedAt,
                  })
                }}
              >
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="PUBLISHED">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de publication</Label>
              <Input
                type="date"
                value={form.publishedAt ?? ''}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium text-muted-foreground">SEO</p>
            <div className="space-y-2">
              <Label>Titre SEO</Label>
              <Input
                value={form.seoMetaTitle}
                onChange={(e) => setForm({ ...form, seoMetaTitle: e.target.value })}
                placeholder={form.title}
              />
            </div>
            <div className="space-y-2">
              <Label>Description SEO</Label>
              <Textarea
                value={form.seoMetaDescription}
                onChange={(e) => setForm({ ...form, seoMetaDescription: e.target.value })}
                placeholder={form.excerpt}
              />
            </div>
            <ImageUploadField
              label="Image de partage (OG)"
              value={form.seoOgImageUrl}
              onChange={(seoOgImageUrl) => setForm({ ...form, seoOgImageUrl })}
            />
          </div>
        </>
      )}
    />
  )
}

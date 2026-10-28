import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResourceCrudPage } from '@/components/shared/ResourceCrudPage'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { RichTextField } from '@/components/shared/RichTextField'
import { articlesService } from '@/services/articles.service'
import { PERMISSIONS } from '@/lib/permissions'
import { slugify } from '@/lib/utils'
import type { Article, ArticleStatus } from '@/types'

interface ArticleForm {
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string
  content: string
  status: ArticleStatus
}

const emptyForm: ArticleForm = {
  title: '', slug: '', excerpt: '', coverImageUrl: '', content: '', status: 'DRAFT',
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
            <Label>Contenu</Label>
            <RichTextField value={form.content} onChange={(content) => setForm({ ...form, content })} />
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ArticleStatus })}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    />
  )
}

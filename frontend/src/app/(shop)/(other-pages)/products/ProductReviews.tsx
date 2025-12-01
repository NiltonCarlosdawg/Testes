'use client'

import ReviewItem from '@/components/shop/ReviewItem'
import StarReview from '@/components/shop/StarReview'
import { TReview } from '@/data/data'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Textarea } from '@/shared/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { MessageAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Form from 'next/form'
import React from 'react'

const ProductReviews = ({
  rating,
  reviewNumber,
  reviews,
  className,
}: {
  reviews: TReview[]
  className?: string
  rating: number
  reviewNumber: number
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSubmit = async () => {
    // const formObjectEntries = Object.fromEntries(formData.entries())

    // const review = formData.get('review')?.toString() || ''
    // const rating = formData.get('rating') ? parseInt(formData.get('rating')?.toString() || '0', 10) : 0
    // if (!review || rating < 1 || rating > 5) {
    //   return
    // }
    // setIsOpen(false)
  }

  return (
    <div className={clsx(className)}>
      <div>
        {/* HEADING */}
        <h2 className="flex scroll-mt-8 items-center text-2xl font-semibold" id="reviews">
          <StarIcon className="mb-0.5 size-7" />
          <span className="ml-1.5">
            {rating} · {reviewNumber} Comentários
          </span>
        </h2>

        {/* comment */}
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
            {reviews.map((review) => (
              <ReviewItem key={review.id} data={review} />
            ))}
          </div>
        </div>

        {/* Add review form */}
        <Button className="mt-10" onClick={() => setIsOpen(true)}>
          <HugeiconsIcon icon={MessageAdd01Icon} size={20} />
          Escrever um comentario
        </Button>

        <Dialog size="2xl" open={isOpen} onClose={setIsOpen}>
          <DialogTitle>
            <div className="flex items-center">
              <HugeiconsIcon icon={MessageAdd01Icon} size={20} className="mr-2" />
              Escrever um comentario
            </div>
          </DialogTitle>
          <DialogDescription>
            Seu endereço de e-mail não será publicado. Os campos obrigatórios estão marcados com um asterisco.(*).
          </DialogDescription>
          <DialogBody>
            <Form action={handleSubmit} id="review-form">
              <Fieldset>
                <StarReview />
                <Field className="mt-5">
                  <Label>Seu comentário *</Label>
                  <Textarea name="review" placeholder="" rows={6} />
                </Field>
              </Fieldset>
            </Form>
          </DialogBody>
          <DialogActions>
            <Button size="smaller" plain onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button size="smaller" onClick={() => setIsOpen(false)} type="submit" form="review-form">
              Enviar comentario
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews

'use client'

import Heading from '@/components/shop/Heading/Heading'
import { Button } from '@/shared/Button/Button'
import Nav from '@/shared/Nav/Nav'
import NavItem2 from '@/shared/Nav/NavItem2'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import React, { FC, useState } from 'react'
import CollectionCard4 from '../CollectionCard4'

interface Category {
  id: string;
  nome: string;
  imagem?: string;
}

interface GroupCollection {
  id: string;
  title: string;
  iconSvg: string;
  collections: Category[]
}

export interface SectionGridMoreExploreProps {
  className?: string
  groupCollections: GroupCollection[]
  heading?: string
}

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  className,
  groupCollections,
  heading = 'Comece a explorar.',
}) => {
  const [tabActive, setTabActive] = useState(groupCollections[0]?.id)

  const groupSelected = groupCollections.find((group) => group.id === tabActive)

  return (
    <div className={clsx('relative', className)}>
      <Heading
        className="mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50"
        fontClass="text-3xl md:text-4xl 2xl:text-5xl font-semibold"
        isCenter
      >
        {heading}
      </Heading>

      <div className="relative mb-12 flex w-full justify-center lg:mb-14">
        <Nav className="rounded-full bg-white p-1 shadow-lg dark:bg-neutral-800">
          {groupCollections.map((group) => (
            <NavItem2 key={group.id} isActive={tabActive === group.id} onClick={() => setTabActive(group.id)}>
              <div className="flex items-center justify-center gap-x-2 sm:gap-x-3">
                <span className="-ml-0.5 inline-block" dangerouslySetInnerHTML={{ __html: group.iconSvg }}></span>
                <span>{group.title}</span>
              </div>
            </NavItem2>
          ))}
        </Nav>
      </div>

      <div className="grid gap-4 md:gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {groupSelected?.collections.map((collection) => (
          <CollectionCard4 key={collection.id} collection={collection} />
        ))}
      </div>

      <div className="mt-20 flex justify-center">
        <Button color="light" href="/collections/all">
          Explorar todas as coleções
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default SectionGridMoreExplore
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ShowCaseBlock } from '@/blocks/ShowCase/Component'
import { TwoSideWithContentBlock } from '@/blocks/TwoSideWithContent/Component'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'
import { CallToActionBlock } from './CallToAction/Component'

const blockComponents = {
  carousel: CarouselBlock,
  showcase: ShowCaseBlock,
  twoSideWithContent: TwoSideWithContentBlock,
  cta: CallToActionBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  className?: string
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div key={index}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block id={toKebabCase(blockName!)} {...block} className={props.className} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}

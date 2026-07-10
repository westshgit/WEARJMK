'use client'
import { motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@wrksz/themes/client'

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
] as const

export function ThemeModeSelector() {
  const { setTheme } = useTheme()

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-primary">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent align="end">
          <motion.div
            animate="open"
            initial="closed"
            transition={{ staggerChildren: 0.04 }}
            variants={{
              closed: {},
              open: {},
            }}
          >
            {themeOptions.map((option) => (
              <motion.div
                key={option.value}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                variants={{
                  closed: { opacity: 0, y: 8 },
                  open: { opacity: 1, y: 0 },
                }}
              >
                <DropdownMenuItem onClick={() => setTheme(option.value)}>{option.label}</DropdownMenuItem>
              </motion.div>
            ))}
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent side="left">
        <h6 className="font-medium">Toggle theme</h6>
      </TooltipContent>
    </Tooltip>
  )
}

import { AnimatePresence, motion } from 'motion/react'
import { useWizard } from 'react-use-wizard'
import { CardContent, CardHeader, Card, CardTitle, CardDescription } from '../ui/card'
import { Button } from '@/components/ui/button'
import { FormItem } from '@/components/forms/FormItem'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Address } from '@/payload-types'
import { AddressItem } from '../addresses/AddressItem'
import { CreateAddressModal } from '../addresses/CreateAddressModal'
import { Mail, MapPin, Pencil } from 'lucide-react'

export const GuestContactStep: React.FC<{
  email: string
  setEmail: (email: string) => void
  emailEditable: boolean
  setEmailEditable: (val: boolean) => void
}> = ({ email, setEmail, emailEditable, setEmailEditable }) => {
  const { nextStep } = useWizard()

  return (
    <Card className="max-w-md!">
      <CardHeader>
        <CardTitle className="uppercase text-2xl">Contact</CardTitle>
        <CardDescription>Enter your email to checkout as a guest.</CardDescription>
      </CardHeader>

      <CardContent>
        <FormItem className="mb-6">
          <Label htmlFor="email" className="font-mono! uppercase text-sm">
            Email Address
          </Label>
          <Input disabled={!emailEditable} id="email" name="email" onChange={(e) => setEmail(e.target.value)} required type="email" value={email} />
        </FormItem>

        <Button
          disabled={!email}
          onClick={(e) => {
            e.preventDefault()
            setEmailEditable(false)
            nextStep()
          }}
          variant="default"
          className="uppercase"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}

export const GuestAddressStep: React.FC<{
  email: string
  billingAddress?: Partial<Address>
  setBillingAddress: (address: Partial<Address>) => void
}> = ({ email, billingAddress, setBillingAddress }) => {
  const { nextStep, previousStep } = useWizard()

  return (
    <Card className="max-w-md!">
      <CardHeader>
        <CardTitle className="uppercase text-2xl">Address</CardTitle>
        <CardDescription>Where should we send your order?</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {billingAddress ? (
          <AddressItem
            actions={
              <Button
                variant={'destructive'}
                className="uppercase"
                size={'sm'}
                onClick={(e) => {
                  e.preventDefault()
                  setBillingAddress(undefined as unknown as Partial<Address>)
                }}
              >
                Remove
              </Button>
            }
            address={billingAddress}
          />
        ) : (
          <CreateAddressModal disabled={!email} callback={(address) => setBillingAddress(address)} skipSubmission={true} />
        )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="uppercase flex-1 shadow!"
            onClick={(e) => {
              e.preventDefault()
              previousStep()
            }}
          >
            Back
          </Button>
          <Button
            disabled={!billingAddress}
            variant="default"
            className="uppercase flex-1 shadow!"
            onClick={(e) => {
              e.preventDefault()
              nextStep()
            }}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const GuestReviewStep: React.FC<{
  email: string
  billingAddress?: Partial<Address>
}> = ({ email, billingAddress }) => {
  const { goToStep } = useWizard()

  return (
    <Card className="max-w-md!">
      <CardHeader>
        <CardTitle className="uppercase text-2xl">Review</CardTitle>
        <CardDescription>Confirm your details before continuing to payment.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            {email}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              goToStep(0)
            }}
          >
            <Pencil className="size-4" />
          </Button>
        </div>

        {billingAddress && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="size-4 shrink-0 text-muted-foreground mt-0.5" />
              <AddressItem address={billingAddress} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                goToStep(1)
              }}
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AnimatedWizardWrapper({ children }: { children?: React.ReactNode }) {
  const { activeStep } = useWizard()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 30, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -30, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

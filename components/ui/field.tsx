import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ComponentProps,
  type ElementRef,
  type HTMLAttributes,
} from "react"

type FieldContextValue = {
  id: string
  hasError: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

function useFieldContext() {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error(
      "Unable to find a <Field /> in the component tree. Make sure to wrap your component in a <Field />",
    )
  }
  return context
}

const Field = forwardRef<
  ElementRef<"div">,
  {
    hasError?: boolean
  } & ComponentProps<"div">
>(({ children, className, hasError = false, ...props }, ref) => {
  const id = useId()
  return (
    <FieldContext.Provider value={{ id, hasError }}>
      <div
        ref={ref}
        className={cn("grid w-full items-center gap-1.5", className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  )
})
Field.displayName = "Field"

const FieldGroup = forwardRef<
  ElementRef<"div">,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
})
FieldGroup.displayName = "FieldGroup"

const FieldLabel = forwardRef<
  ElementRef<"label">,
  ComponentProps<"label">
>(({ className, ...props }, ref) => {
  const { id } = useFieldContext()
  return (
    <label
      ref={ref}
      htmlFor={id}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
})
FieldLabel.displayName = "FieldLabel"

const FieldDescription = forwardRef<
  ElementRef<"p">,
  ComponentProps<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FieldDescription.displayName = "FieldDescription"

const FieldError = forwardRef<
  ElementRef<"p">,
  ComponentProps<"p">
>(({ className, ...props }, ref) => {
  const { hasError } = useFieldContext()
  if (!hasError) {
    return null
  }
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    />
  )
})
FieldError.displayName = "FieldError"

const FieldSeparator = forwardRef<
  ElementRef<"div">,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      role="separator"
      {...props}
    >
      <div className="absolute inset-0 flex items-center">
        <span className="h-px w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span
          className="bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      </div>
    </div>
  )
})
FieldSeparator.displayName = "FieldSeparator"

const FieldControl = forwardRef<ElementRef<typeof Slot>, ComponentProps<typeof Slot>>(
  (props, ref) => {
    const { id, hasError } = useFieldContext()
    return <Slot ref={ref} id={id} aria-invalid={hasError} {...props} />
  },
)
FieldControl.displayName = "FieldControl"

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  useFieldContext,
}

export const InputContainer = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={`flex flex-col gap-1 ${className}`}>{children}</div>
}

import { signOutAction } from "@/app/actions/auth";

type Props = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function UserBadge({ name, email, image }: Props) {
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();
  return (
    <div className="rounded-xl border border-[var(--separator)] p-3 flex items-center gap-3">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <div className="size-8 rounded-full bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] grid place-items-center text-white text-[12px] font-semibold">
          {initial}
        </div>
      )}
      <div className="flex flex-col leading-tight min-w-0 flex-1">
        <span className="text-[12.5px] font-medium text-label truncate">
          {name ?? "Signed in"}
        </span>
        {email && (
          <span className="text-[11px] text-label-tertiary truncate">
            {email}
          </span>
        )}
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="size-7 rounded-lg grid place-items-center text-label-tertiary hover:text-label hover:bg-[color-mix(in_oklch,var(--separator)_60%,transparent)] transition-colors"
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H6a2 2 0 00-2 2v8a2 2 0 002 2h5" />
            <path d="M14 13l3-3-3-3M9 10h8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

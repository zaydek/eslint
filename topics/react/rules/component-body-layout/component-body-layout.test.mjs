import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { componentBodyLayoutRule } from "./component-body-layout.mjs";

const ruleTester = createRuleTester();

ruleTester.run("component-body-layout", componentBodyLayoutRule, {
  valid: [
    `
function EditModal(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const doneRef = React.useRef(false);

  const [name, setName] = useState('');
  const [state, dispatchState] = React.useReducer(reducer, initialState);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0;
  const routeId = params.id ?? '';
  const handleCancel = useCallback(function handleCancel(): void {
    navigate('/cancel');
  }, [navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [routeId]);

  function handleSave(): void {
    doneRef.current = true;
  }

  const handlers = {
    onCancel: handleCancel,
    onSave: handleSave,
  };

  return <button disabled={!canSave} onClick={handlers.onSave}>{state.kind}</button>;
}
`,
    `
function EmptyState(): JSX.Element {
  return <div />;
}
`,
    `
function MaybeDialog(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return null;
  }
  return <div />;
}
`,
    `
function getValue(): string {
  const [value, setValue] = useState('');
  return value;
}
`,
  ],
  invalid: [
    {
      code: `
function EditModal(): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState('');

  return <input ref={inputRef} value={name} />;
}
`,
      errors: [{ messageId: "spacing" }],
    },
    {
      code: `
function EditModal(): JSX.Element {
  const [name, setName] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  return <input ref={inputRef} value={name} />;
}
`,
      errors: [{ messageId: "order" }],
    },
    {
      code: `
function EditModal(): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);


  const [name, setName] = useState('');

  return <input ref={inputRef} value={name} />;
}
`,
      errors: [{ messageId: "spacing" }],
    },
    {
      code: `
function DashboardContent(): JSX.Element {
  const params = useParams();
  const raw = params["*"] ?? "";

  const appRef = useRef<HTMLDivElement | null>(null);

  return <div ref={appRef}>{raw}</div>;
}
`,
      errors: [{ messageId: "spacing" }, { messageId: "order" }],
    },
  ],
});

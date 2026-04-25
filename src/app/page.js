import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home Page Working ✅</h1>

      <Link href="/auth/signup">
        <button style={{ marginTop: "20px" }}>
          Go to Signup 🚀
          
        </button>
      </Link>
      <Link href="/auth/Employeelogin">
        <button style={{ marginTop: "20px" }}>
          Employeelogin
          
        </button>
      </Link>
    </div>
  );
}
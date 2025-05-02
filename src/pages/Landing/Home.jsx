// import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Navbar /> */}
      {/* Sección principal */}
      <div
        className="flex flex-col items-center justify-center text-center bg-cover bg-center text-white h-screen"
        style={{
          backgroundImage:
            "url('https://www.peluker.com/blog/wp-content/uploads/2024/11/Image04Inspiracion-en-mobiliario-de-barberia-vintage-para-un-look-clasico.jpg')",
        }}
      >
        <h1 className="text-5xl font-bold">The Barber House</h1>
        <p className="text-2xl">Slogan o presentación breve</p>
      </div>
    </div>
  );
}

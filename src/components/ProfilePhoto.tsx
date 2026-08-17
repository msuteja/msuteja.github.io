import { useState } from "react";

export function ProfilePhoto() {
  const [missing, setMissing] = useState(false);

  return (
    <div className="profile-photo" aria-label="Michael Suteja profile photo">
      {missing ? (
        <span aria-hidden="true">your photo</span>
      ) : (
        <img
          src={`${import.meta.env.BASE_URL}profilepic2.jpg`}
          alt="Michael Suteja"
          onError={() => setMissing(true)}
        />
      )}
    </div>
  );
}

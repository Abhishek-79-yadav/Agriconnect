import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, KeyRound, Mail, Phone, MapPin } from "lucide-react";

import { getProfile } from "../../api/authApi";
import Loader from "../../components/ui/Loader";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const ROLE_TONE = { ADMIN: "gold", FARMER: "field", BUYER: "slate" };

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) return <Loader label="Loading profile..." full />;

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-lg border border-line bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile.name} size={56} />
          <div>
            <h1 className="font-display text-xl text-ink">{profile.name}</h1>
            <Badge text={profile.role} tone={ROLE_TONE[profile.role] || "neutral"} className="mt-1" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-ink/70">
          <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {profile.email}</span>
          {profile.mobile && <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {profile.mobile}</span>}
          {(profile.city || profile.state) && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {[profile.city, profile.state].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/profile/edit">
            <Button variant="outline"><Pencil className="h-4 w-4" /> Edit profile</Button>
          </Link>
          <Link to="/profile/change-password">
            <Button variant="ghost"><KeyRound className="h-4 w-4" /> Change password</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

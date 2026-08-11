import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchSchemesThunk } from "../../redux/thunks/schemeThunk";
import SchemeCard from "../../components/cards/SchemeCard";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/ui/EmptyState";

export default function Schemes() {
  const dispatch = useDispatch();
  const schemes = useSelector((state) => state.scheme.schemes);

  useEffect(() => {
    dispatch(fetchSchemesThunk());
  }, [dispatch]);

  return (
    <div>
      <PageHeader title="Government schemes" />

      {!schemes?.length ? (
        <EmptyState title="No schemes listed" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}

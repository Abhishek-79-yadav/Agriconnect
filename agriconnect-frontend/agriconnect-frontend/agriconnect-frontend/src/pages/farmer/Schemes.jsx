import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchSchemesThunk } from "../../redux/thunks/schemeThunk";
import SchemeCard from "../../components/cards/SchemeCard";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";

export default function Schemes() {
  const dispatch = useDispatch();
  const { schemes, loading } = useSelector((state) => state.scheme);
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    dispatch(fetchSchemesThunk());
  }, [dispatch]);

  const states = [...new Set(schemes.map((s) => s.state).filter(Boolean))];
  const visible = stateFilter ? schemes.filter((s) => s.state === stateFilter) : schemes;

  return (
    <div>
      <PageHeader title="Government schemes" subtitle="Subsidies and support programs you may be eligible for." />

      {states.length > 0 && (
        <Select
          placeholder="All states"
          options={states.map((s) => ({ value: s, label: s }))}
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="mb-6 max-w-xs"
        />
      )}

      {loading ? (
        <Loader label="Loading schemes..." />
      ) : !visible.length ? (
        <EmptyState title="No schemes available" description="Check back later, or try a different state." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}

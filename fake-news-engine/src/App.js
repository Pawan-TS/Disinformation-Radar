import { jsx as _jsx } from "react/jsx-runtime";
import { DbConnection } from './module_bindings';
import { LiveThreatDashboard } from './dashboard/LiveThreatDashboard';
import { SpacetimeDBProvider } from 'spacetimedb/react';
export default function App() {
    const host = import.meta.env.SPACETIME_HOST || 'localhost:3000';
    const dbName = import.meta.env.SPACETIME_DB_NAME || 'fake-news-engine';
    const connectionBuilder = DbConnection.builder()
        .withUri(`ws://${host}`)
        .withDatabaseName(dbName);
    return (_jsx(SpacetimeDBProvider, { connectionBuilder: connectionBuilder, children: _jsx(LiveThreatDashboard, {}) }));
}

// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: engine/scripts/export_openapi.py

export interface paths {
    "/chart/klines": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Chart Klines */
        get: operations["chart_klines_chart_klines_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/score": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Score
         * @description Compute features + ML score for the latest bar.
         */
        post: operations["score_score_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/deep": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Deep
         * @description Run all L2 market_engine indicators for a single symbol.
         */
        post: operations["deep_deep_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ctx/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ctx Status
         * @description Return a diagnostic snapshot of the current GlobalCtx cache.
         */
        get: operations["ctx_status_ctx_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ctx/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ctx Refresh
         * @description Force a full GlobalCtx refresh and return the updated summary.
         *
         *     This blocks until all L0 fetches complete (typically 3-8 seconds).
         *     Concurrent calls share the single in-flight request.
         */
        post: operations["ctx_refresh_ctx_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ctx/kimchi-premium": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ctx Kimchi Premium
         * @description Return current Kimchi Premium % (Upbit BTC/KRW vs Binance BTC/USDT × USD/KRW).
         *
         *     30s server-side cache (function-level). Returns zeros on fetch failure.
         *     Response: { premium_pct, source, usd_krw, ts }
         */
        get: operations["ctx_kimchi_premium_ctx_kimchi_premium_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ctx/fact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ctx Fact
         * @description Return a bounded engine-owned fact context for one symbol/timeframe.
         */
        get: operations["ctx_fact_ctx_fact_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/price-context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Price Context */
        get: operations["facts_price_context_facts_price_context_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/perp-context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Perp Context */
        get: operations["facts_perp_context_facts_perp_context_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/reference-stack": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Reference Stack */
        get: operations["facts_reference_stack_facts_reference_stack_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/chain-intel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Chain Intel */
        get: operations["facts_chain_intel_facts_chain_intel_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/market-cap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Market Cap */
        get: operations["facts_market_cap_facts_market_cap_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/confluence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Confluence */
        get: operations["facts_confluence_facts_confluence_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/facts/indicator-catalog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Facts Indicator Catalog */
        get: operations["facts_indicator_catalog_facts_indicator_catalog_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/catalog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search Catalog */
        get: operations["search_catalog_search_catalog_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/seed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search Seed */
        post: operations["search_seed_search_seed_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/seed/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search Seed Result */
        get: operations["search_seed_result_search_seed__run_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search Scan */
        post: operations["search_scan_search_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/scan/{scan_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search Scan Result */
        get: operations["search_scan_result_search_scan__scan_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/query-spec/transform": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search Query Spec Transform */
        post: operations["search_query_spec_transform_search_query_spec_transform_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/similar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Search Similar
         * @description 3-layer pattern similarity search.
         *
         *     Layer A — feature signature distance (always active)
         *     Layer B — phase path LCS similarity (active when observed_phase_paths provided)
         *     Layer C — ML p_win from LightGBM (active when model is trained)
         */
        post: operations["search_similar_search_similar_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/similar/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search Similar Result */
        get: operations["search_similar_result_search_similar__run_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/quality/judge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Search Quality Judge
         * @description Record a user judgement (good/bad/neutral) on a search candidate.
         *
         *     This feeds the weight recalibration loop: after _MIN_SAMPLES_FOR_RECALIBRATION
         *     judgements the blend weights for Layer A/B/C shift toward whichever layer
         *     has the higher user-validated accuracy.
         */
        post: operations["search_quality_judge_search_quality_judge_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/quality/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search Quality Stats
         * @description Return per-layer accuracy stats and the current active blend weights.
         */
        get: operations["search_quality_stats_search_quality_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/captures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Runtime Captures */
        get: operations["list_runtime_captures_runtime_captures_get"];
        put?: never;
        /**
         * Create Runtime Capture
         * @description Create a canonical runtime capture.
         *
         *     This route reuses the existing CaptureRecord schema while moving new
         *     runtime consumers to the `/runtime` plane.
         */
        post: operations["create_runtime_capture_runtime_captures_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/captures/{capture_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Runtime Capture */
        get: operations["get_runtime_capture_runtime_captures__capture_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/definitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Runtime Definitions */
        get: operations["list_runtime_definitions_runtime_definitions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/definitions/{pattern_slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Runtime Definition */
        get: operations["get_runtime_definition_runtime_definitions__pattern_slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/workspace/pins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Workspace Pin */
        post: operations["create_workspace_pin_runtime_workspace_pins_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/workspace/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Workspace */
        get: operations["get_workspace_runtime_workspace__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/setups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Setup */
        post: operations["create_setup_runtime_setups_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/setups/{setup_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Setup */
        get: operations["get_setup_runtime_setups__setup_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/research-contexts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Research Context */
        post: operations["create_research_context_runtime_research_contexts_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/research-contexts/{context_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Research Context */
        get: operations["get_research_context_runtime_research_contexts__context_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/ledger/{ledger_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Ledger */
        get: operations["get_ledger_runtime_ledger__ledger_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/runtime/ledger": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Ledger */
        get: operations["list_ledger_runtime_ledger_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/universe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Universe
         * @description Return ranked token universe.
         *
         *     Query params:
         *         limit   : max tokens to return (default 200, max 500)
         *         sector  : sector filter (e.g. "DeFi", "AI", "Meme") — empty = all
         *         sort    : sort field — rank | vol | trending | oi | pct24h
         *         refresh : set true to force-rebuild the cache
         */
        get: operations["universe_universe_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/universe/sectors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Sectors
         * @description Return list of distinct sectors in the current universe.
         */
        get: operations["sectors_universe_sectors_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/universe/search/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Market Search Status */
        get: operations["market_search_status_universe_search_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/opportunity/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Run */
        post: operations["run_opportunity_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backtest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Backtest
         * @description Run a portfolio backtest for the given block set over the universe.
         */
        post: operations["backtest_backtest_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/challenge/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Challenge
         * @description Register a new challenge from 1–5 reference snaps.
         */
        post: operations["create_challenge_challenge_create_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/challenge/{slug}/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Scan Challenge
         * @description Find current universe bars that match the saved challenge pattern.
         */
        get: operations["scan_challenge_challenge__slug__scan_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/train": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Train
         * @description Retrain LightGBM on new trade records.
         *
         *     Records with outcome == -1 (timeout / neutral) are excluded from
         *     training — only clear wins (1) and losses (0) are used.
         */
        post: operations["train_train_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/train/report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Train Report
         * @description Model report endpoint with feature importance ranking.
         */
        get: operations["train_report_train_report_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/verdict": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verdict
         * @description Compute auto-verdict for a signal given subsequent bars.
         */
        post: operations["verdict_verdict_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/scanner/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger Scan
         * @description Run a full scan cycle and optionally send Telegram alerts.
         */
        post: operations["trigger_scan_scanner_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/selection/gate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Selection Gate
         * @description Evaluate a chart selection's deployability.
         */
        post: operations["selection_gate_selection_gate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/parse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Parse Pattern Text
         * @description Parse free-text trading memo → PatternDraftBody JSON via configured LLM.
         *
         *     AC: POST {"text": "OI가 급등하면서 가격이 하락했다"} → PatternDraftBody JSON
         */
        post: operations["parse_pattern_text_patterns_parse_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/library": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Patterns
         * @description List all patterns in the library.
         */
        get: operations["list_patterns_patterns_library_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/registry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Registry
         * @description Return the JSON-backed pattern registry (versioned metadata per slug).
         */
        get: operations["get_pattern_registry_patterns_registry_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/active-variants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Active Variants
         * @description Return the effective active pattern variants used by live runtime.
         */
        get: operations["get_active_variants_patterns_active_variants_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/states": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All States
         * @description Current phase (rich) for all tracked symbols across all patterns.
         */
        get: operations["get_all_states_patterns_states_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/transitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Recent Transitions
         * @description Recent phase transitions, optionally filtered by symbol or pattern slug.
         */
        get: operations["get_recent_transitions_patterns_transitions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Candidates
         * @description Entry candidates across all patterns, augmented with market context.
         */
        get: operations["get_all_candidates_patterns_candidates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/draft-from-range": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Draft From Range
         * @description Extract 12 features from a chart range and return a PatternDraftBody.
         *
         *     Accepts (symbol, start_ts, end_ts) and computes features over that window.
         *     Features unavailable from a single-symbol window (btc_corr, venue_div)
         *     are returned as null — this is not an error per spec.
         */
        post: operations["draft_from_range_patterns_draft_from_range_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger Pattern Scan
         * @description Trigger a pattern scan cycle in background.
         */
        post: operations["trigger_pattern_scan_patterns_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/stats/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Stats
         * @description Bulk ledger stats for all patterns — avoids N+1 fan-out from callers.
         */
        get: operations["get_all_stats_patterns_stats_all_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/lifecycle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Lifecycle Statuses
         * @description Return lifecycle status for all known PatternObjects.
         *
         *     File-backed lifecycle records are sparse. Existing library patterns are
         *     production objects by default; explicit draft/candidate/archive records
         *     override that default.
         */
        get: operations["get_lifecycle_statuses_patterns_lifecycle_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Candidates
         * @description Entry candidates for a specific pattern.
         */
        get: operations["get_candidates_patterns__slug__candidates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/similar-live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Similar Live
         * @description Return current symbols ranked by pattern-state similarity for one family.
         */
        get: operations["get_similar_live_patterns__slug__similar_live_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/f60-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get F60 Gate Status
         * @description F-60 multi-period acceptance gate (L-3, R-05).
         *
         *     Returns:
         *         passed: bool — gate 통과 여부 (median≥0.55 AND floor≥0.40 AND count≥200)
         *         verdict_count: int — 누적 verdict 수 (all 5 cats included)
         *         remaining_to_threshold: int — 200까지 남은 수
         *         median_accuracy / floor_accuracy: float — W1/W2/W3 통계
         *         window_accuracies / window_counts: list — 30d 윈도우 3개 분포
         *         reason: "insufficient_data" | "insufficient_windows" | "failed_threshold" | "passed"
         *
         *     근거: Ryan Li 16-seed validation + Kropiunig $32 variance on identical code.
         *     Single-period accuracy 0.60이 multi-period 0.45보다 나쁠 수 있음 → median+floor.
         */
        get: operations["get_f60_gate_status_patterns__slug__f60_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Stats
         * @description Ledger statistics for a pattern. v3: includes ML shadow readiness.
         */
        get: operations["get_stats_patterns__slug__stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/pnl-stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pnl Stats
         * @description W-0365: Realized P&L statistics for a pattern slug.
         *
         *     Queries ledger_outcomes for pnl_bps_net + pnl_verdict.
         *     Returns preliminary=True if N < 30.
         */
        get: operations["get_pnl_stats_patterns__slug__pnl_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/trades": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Trades
         * @description Individual paper trade records for a pattern from ledger_outcomes.
         *
         *     Returns resolved outcomes only (pnl_verdict IS NOT NULL).
         *     Fields: id, outcome, exit_return_pct, duration_hours, entry_side,
         *             exit_reason, pnl_bps_net, pnl_pct_net, pnl_verdict,
         *             holding_bars, mfe_bps, mae_bps, created_at
         */
        get: operations["get_pattern_trades_patterns__slug__trades_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/training-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Training Records
         * @description Preview canonical training rows derived from the ledger.
         */
        get: operations["get_training_records_patterns__slug__training_records_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/alert-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alert Policy
         * @description Return current alert policy for a pattern.
         */
        get: operations["get_alert_policy_patterns__slug__alert_policy_get"];
        /**
         * Set Alert Policy
         * @description Update current alert policy for a pattern.
         */
        put: operations["set_alert_policy_patterns__slug__alert_policy_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/lifecycle-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Lifecycle Status
         * @description Return current lifecycle status for a pattern (draft/candidate/object/archived).
         */
        get: operations["get_lifecycle_status_patterns__slug__lifecycle_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Patch Pattern Status
         * @description Transition pattern lifecycle status.
         *
         *     Allowed: draft→candidate|archived, candidate→object|archived, object→archived.
         *     Returns { ok, slug, from_status, to_status, updated_at }.
         *     Raises 422 on invalid transition, 404 if pattern not in library.
         */
        patch: operations["patch_pattern_status_patterns__slug__status_patch"];
        trace?: never;
    };
    "/patterns/{slug}/model-registry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Model Registry
         * @description Return the current registry snapshot for a pattern.
         */
        get: operations["get_model_registry_patterns__slug__model_registry_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/model-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Model History
         * @description Return training/model ledger history for a pattern.
         */
        get: operations["get_model_history_patterns__slug__model_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/library": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Def
         * @description Return the pattern definition.
         */
        get: operations["get_pattern_def_patterns__slug__library_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/verdict": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Verdict
         * @description Per-pattern verdict (all-time + trailing 90d).
         *
         *     Returns the empty shape (confidence='insufficient') if no row exists or
         *     Supabase is unavailable — never 5xx.
         */
        get: operations["get_verdict_patterns__slug__verdict_get"];
        put?: never;
        /**
         * Set User Verdict
         * @description Set user_verdict on the most recent outcome for (slug, symbol).
         */
        post: operations["set_user_verdict_patterns__slug__verdict_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/capture": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Record Capture
         * @description Record a Save Setup capture event into the ledger capture plane.
         *
         *     Links the capture to a durable phase transition via candidate_transition_id
         *     so the full chain capture_id → transition_id → outcome_id → verdict is traceable.
         */
        post: operations["record_capture_patterns__slug__capture_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/evaluate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Auto Evaluate
         * @description v2: Auto-evaluate pending outcomes past their evaluation window.
         */
        post: operations["auto_evaluate_patterns__slug__evaluate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/train-model": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Train Pattern Model
         * @description Train a pattern-scoped model from durable ledger outcomes.
         */
        post: operations["train_pattern_model_patterns__slug__train_model_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/promote-model": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Promote Pattern Model
         * @description Promote a candidate model to active rollout state.
         */
        post: operations["promote_pattern_model_patterns__slug__promote_model_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register Pattern
         * @description Register a user-defined pattern into the library and persist to Supabase.
         *
         *     W-0515 PR2: DB upsert first, then PATTERN_LIBRARY update.
         *     Requires Authorization: Bearer <supabase-jwt> for user_id attribution.
         *     Anonymous registration still works but skips DB persist.
         */
        post: operations["register_pattern_patterns_register_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/benchmark-pack-draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Benchmark Pack Draft
         * @description Build a benchmark pack from a capture and save it.
         */
        post: operations["create_benchmark_pack_draft_patterns__slug__benchmark_pack_draft_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/benchmark-search-from-capture": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Benchmark Search From Capture
         * @description Build benchmark pack and run a full benchmark search from a capture.
         */
        post: operations["run_benchmark_search_from_capture_patterns__slug__benchmark_search_from_capture_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/objects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Pattern Objects
         * @description List all seeded PatternObjects from Supabase.
         *
         *     ?phase=FAKE_DUMP  — filter by phase_id
         *     ?tag=oi_reversal  — filter by tag
         */
        get: operations["list_pattern_objects_patterns_objects_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/objects/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Object
         * @description Get one PatternObject by slug.
         */
        get: operations["get_pattern_object_patterns_objects__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/verify-paper": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Paper
         * @description Run paper-trading verification for a pattern using recorded outcome ledger.
         */
        post: operations["verify_paper_patterns__slug__verify_paper_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/backtest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Backtest
         * @description Historical backtest stats for a pattern (W-0369 Phase 1).
         *
         *     ?tf=1h            — kline timeframe
         *     ?universe=default — comma-separated symbols, or "default" for DEFAULT_UNIVERSE
         *     ?since_days=365   — lookback window in days
         */
        get: operations["get_pattern_backtest_patterns__slug__backtest_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Signals
         * @description Recent live signals for a pattern with resolved outcomes (W-0370 Phase 1).
         *
         *     Returns signals from scan_signal_events LEFT-joined with scan_signal_outcomes
         *     (horizon_h=72). Unresolved signals appear as outcome='pending'.
         */
        get: operations["get_pattern_signals_patterns__slug__signals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/compare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Compare Patterns
         * @description GET /patterns/compare?slugs=SLUG_A,SLUG_B — side-by-side stats for 2 patterns.
         */
        get: operations["compare_patterns_patterns_compare_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/spawn-paper": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Spawn Paper
         * @description Enqueue paper trades for the K nearest historical neighbors.
         *
         *     The endpoint is `200 OK` for empty similarity and dedup hits — these are
         *     reported via response flags (HC4: silent-break prevention).
         */
        post: operations["spawn_paper_patterns__slug__spawn_paper_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/verdicts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Verdicts
         * @description Batch verdicts. Up to 50 slugs per request. Missing slugs return empty shape.
         */
        get: operations["get_verdicts_patterns_verdicts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Captures */
        get: operations["list_captures_captures_get"];
        put?: never;
        /**
         * Create Capture
         * @description Create a canonical capture record from Save Setup.
         */
        post: operations["create_capture_captures_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/bulk_import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Bulk Import Captures
         * @description Cold-start lane: ingest N founder hypotheses in one call.
         *
         *     Every row becomes a ``manual_hypothesis`` CaptureRecord with
         *     ``status='pending_outcome'`` so outcome_resolver (scanner Job 3b)
         *     picks it up on the next window tick.
         */
        post: operations["bulk_import_captures_captures_bulk_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/outcomes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Verdict Inbox
         * @description Verdict Inbox — resolved captures awaiting user verdict.
         *
         *     Defaults to ``status='outcome_ready'`` (needs review). Pass
         *     ``status='verdict_ready'`` to inspect previously labelled items.
         */
        get: operations["list_verdict_inbox_captures_outcomes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/{capture_id}/verdict": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Set Capture Verdict
         * @description Apply user verdict to a resolved capture.
         *
         *     Requires status in {'outcome_ready', 'verdict_ready'} — the capture must
         *     have a linked PatternOutcome. The verdict is written to the outcome
         *     record, appended to LEDGER:verdict, and the capture is flipped to
         *     ``status='verdict_ready'`` so it leaves the inbox.
         */
        post: operations["set_capture_verdict_captures__capture_id__verdict_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/{capture_id}/benchmark_pack_draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Capture Benchmark Pack Draft */
        post: operations["create_capture_benchmark_pack_draft_captures__capture_id__benchmark_pack_draft_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/{capture_id}/benchmark_search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Capture Benchmark Search */
        post: operations["create_capture_benchmark_search_captures__capture_id__benchmark_search_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/chart-annotations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Chart Annotations
         * @description Return capture markers formatted for TradingView chart overlay.
         *
         *     Poll at ~60s intervals. Each annotation includes price levels from
         *     chart_context so the frontend can render entry/stop/tp lines.
         *
         *     Response shape (one entry per capture):
         *       capture_id      — unique ID
         *       kind            — capture_kind
         *       status          — pending_outcome | outcome_ready | verdict_ready | closed
         *       pattern_slug    — e.g. "tradoor-oi-reversal-v1"
         *       phase           — e.g. "SPRING"
         *       captured_at_s   — unix seconds (chart x-axis anchor)
         *       entry_price     — from chart_context.entry_price (null if not set)
         *       stop_price      — from chart_context.stop (null if not set)
         *       tp1_price       — from chart_context.tp1 (null if not set)
         *       tp2_price       — from chart_context.tp2 (null if not set)
         *       eval_window_ms  — evaluation window in ms (for shading end x)
         *       p_win           — float 0–1 if recorded
         *       user_verdict    — "valid" | "invalid" | "near_miss" | "too_early" | "too_late" | null
         */
        get: operations["get_chart_annotations_captures_chart_annotations_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/{capture_id}/watch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Watch Capture
         * @description Mark a capture as watching. Idempotent — calling twice is safe.
         */
        post: operations["watch_capture_captures__capture_id__watch_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/{capture_id}/verdict-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Verdict Deeplink
         * @description F-3: Generate a signed 72h deep-link token for Telegram verdict submission.
         *
         *     Token = HMAC-SHA256 signed payload (stateless, no DB write).
         *     The app /verdict?token=xxx validates and pre-fills the VerdictModal.
         */
        post: operations["create_verdict_deeplink_captures__capture_id__verdict_link_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/captures/{capture_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Capture */
        get: operations["get_capture_captures__capture_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memory/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Memory Query */
        post: operations["memory_query_memory_query_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memory/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Memory Feedback */
        post: operations["memory_feedback_memory_feedback_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memory/feedback/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Memory Feedback Batch */
        post: operations["memory_feedback_batch_memory_feedback_batch_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memory/debug-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Memory Debug Session */
        post: operations["memory_debug_session_memory_debug_session_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memory/rejected/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Memory Rejected Search */
        post: operations["memory_rejected_search_memory_rejected_search_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/screener/runs/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Latest Run */
        get: operations["latest_run_screener_runs_latest_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/screener/listings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listings */
        get: operations["listings_screener_listings_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/screener/assets/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Asset Detail */
        get: operations["asset_detail_screener_assets__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/screener/universe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Filtered Universe */
        get: operations["filtered_universe_screener_universe_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rag/terminal-scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Terminal Scan */
        post: operations["terminal_scan_rag_terminal_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rag/quick-trade": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Quick Trade */
        post: operations["quick_trade_rag_quick_trade_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rag/signal-action": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Signal Action */
        post: operations["signal_action_rag_signal_action_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rag/dedupe-hash": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Dedupe Hash */
        post: operations["dedupe_hash_rag_dedupe_hash_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/live-signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Live Signals
         * @description Return current live scan results (ACCUMULATION / REAL_DUMP candidates).
         *
         *     Results are cached for LIVE_SIGNAL_CACHE_TTL_SECONDS (default 1h) to
         *     avoid hammering the Binance API on every terminal load.
         */
        get: operations["get_live_signals_live_signals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/live-signals/verdict": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Post Verdict
         * @description Record user verdict for a live signal.
         *
         *     Appends one JSON line to verdicts.jsonl.
         */
        post: operations["post_verdict_live_signals_verdict_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/observability/flywheel/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Flywheel Health */
        get: operations["flywheel_health_observability_flywheel_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/observability/agent-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Agent Status
         * @description Real-time harness observability — scheduler jobs + pattern scan state.
         *
         *     Feeds the /status page and CI canary checks.
         *     Returns scheduler job list + flywheel health without full KPI compute.
         */
        get: operations["agent_status_observability_agent_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/gainers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gainers
         * @description 실시간 Binance Futures 상승률 상위 후보 유니버스.
         *
         *     딸깍 전략 원칙: 24h 상승률 + 변동성(ATR%) + 신규 상장 여부를
         *     composite score로 조합해 진입 우선순위를 결정.
         */
        get: operations["gainers_dalkkak_gainers_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/positions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Positions
         * @description 단방향 가드에 등록된 현재 열린 포지션 목록.
         */
        get: operations["list_positions_dalkkak_positions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/positions/open": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Open Position
         * @description 포지션 등록 — 단방향 원칙 검사 후 가드에 기록.
         *
         *     이 엔드포인트는 실제 주문 집행 후 호출한다.
         *     주문 집행 자체는 클라이언트 / 별도 자동매매 모듈이 담당.
         */
        post: operations["open_position_dalkkak_positions_open_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/positions/close": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Close Position
         * @description 포지션 닫기 — 가드에서 제거.
         */
        post: operations["close_position_dalkkak_positions_close_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/caption": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Caption
         * @description 트레이드 결과를 KOL 스타일 SNS 캡션으로 변환.
         *
         *     Claude API (ANTHROPIC_API_KEY) 없으면 plain text fallback.
         */
        post: operations["caption_dalkkak_caption_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/losers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Losers
         * @description 실시간 Binance Futures 하락률 상위 후보 유니버스.
         *
         *     max_price_change_pct 이하로 하락한 종목을 price_change_24h_pct 오름차순으로 반환.
         */
        get: operations["losers_dalkkak_losers_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/trending": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Trending
         * @description 실시간 Binance Futures 거래량 상위 트렌딩 종목.
         *
         *     min_volume_usdt 이상 거래량 종목을 volume_usdt_24h 내림차순으로 반환.
         */
        get: operations["trending_dalkkak_trending_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/portfolio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Portfolio
         * @description 포트폴리오 스냅샷 — 현재 오픈 포지션 기반.
         *
         *     실시간 current_price가 없으므로 unrealized_pnl은 0으로 반환.
         *     account_value는 초기 자본 그대로.
         */
        get: operations["portfolio_dalkkak_portfolio_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dalkkak/risk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Risk Plan
         * @description 200 USDT 고정 손절 기반 포지션 플랜 계산.
         *
         *     진입가와 ATR을 받아서:
         *       - stop 가격 (1.5 ATR, 최대 200U 손실 제한)
         *       - 포지션 크기 (코인 수)
         *       - 목표가 (3:1 R/R)
         *     를 반환.
         *
         *     W-0490 PR3-WIRING: ``ENGINE_KELLY_SIZING_ENABLED=true`` 일 때 ``kelly_plan``
         *     필드 추가 (Fractional Kelly + vol-target advisory). 레거시 ``plan``은 항상 반환.
         */
        get: operations["risk_plan_dalkkak_risk_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/world-model": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha World Model
         * @description Return current phase state for all Alpha Universe symbols.
         *
         *     Optionally filter by watchlist grade (A / B / all).
         */
        get: operations["get_alpha_world_model_alpha_world_model_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/token/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha Token Detail
         * @description Return detailed state for one Alpha Universe token.
         */
        get: operations["get_alpha_token_detail_alpha_token__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/token/{symbol}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha Token History
         * @description Return phase transition history for one symbol.
         */
        get: operations["get_alpha_token_history_alpha_token__symbol__history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/anomalies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha Anomalies
         * @description Return anomaly queue. By default returns unreviewed anomalies.
         */
        get: operations["get_alpha_anomalies_alpha_anomalies_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/watch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Post Alpha Watch
         * @description Register a user watch on a symbol/phase combination.
         */
        post: operations["post_alpha_watch_alpha_watch_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/find": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Post Alpha Find
         * @description Ad-hoc multi-condition token filter across the Alpha Universe.
         *
         *     Each condition can be:
         *       - block:  name of a block in _BLOCKS (fires True/False on latest bar)
         *       - feature: raw column + op + value comparison on the latest features row
         *
         *     Returns symbols where at least min_match conditions are met.
         */
        post: operations["post_alpha_find_alpha_find_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/scroll": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha Scroll
         * @description Scroll segment analysis: indicator snapshot + anomaly flags + similar segments.
         *
         *     Trigger: chart scroll event stops on a time range.
         *     Returns segment analysis + alpha composite score + top-K similar historical windows.
         *     Cache: 5min (same symbol+from+to+tf).
         *     Timeout: 3s.
         */
        get: operations["get_alpha_scroll_alpha_scroll_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/alpha/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha Scan
         * @description Compute Alpha composite scores for a list of symbols or the full universe.
         *
         *     ?symbols=ETHUSDT,BTCUSDT  — specific symbols
         *     ?universe=all             — full 3-source alpha universe
         *     Returns scores sorted descending.
         */
        get: operations["get_alpha_scan_alpha_scan_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/refinement/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Stats
         * @description Return performance stats for all registered patterns.
         */
        get: operations["get_all_stats_refinement_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/refinement/stats/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Stats
         * @description Return detailed stats for a single pattern slug.
         */
        get: operations["get_pattern_stats_refinement_stats__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/refinement/suggestions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Suggestions
         * @description Return actionable threshold suggestions for all patterns with data.
         */
        get: operations["get_suggestions_refinement_suggestions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/refinement/leaderboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Leaderboard
         * @description Rank patterns by expected value (EV = win_rate * avg_gain + loss_rate * avg_loss).
         */
        get: operations["get_leaderboard_refinement_leaderboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/features/window": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Feature Window
         * @description Latest materialized feature_window for symbol/timeframe.
         *
         *     Computes and persists on-demand from local cache (offline=True) if not
         *     yet materialized. Never fans out to providers.
         */
        get: operations["get_feature_window_features_window_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/features/pattern-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Events
         * @description List persisted pattern_events for symbol/timeframe/pattern_family.
         */
        get: operations["get_pattern_events_features_pattern_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description Revoke the caller's JWT.
         *
         *     The token is added to the Redis blacklist with TTL = remaining validity.
         *     Subsequent requests with the same token will receive 403.
         *
         *     Requires: Authorization: Bearer <token>
         */
        post: operations["logout_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{user_id}/f60-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get F60 Status
         * @description H-07: F-60 copy-signal gate status for a user.
         *
         *     Returns verdicts remaining + current accuracy + pass/fail.
         *     Cached 5 min (same TTL as PatternStatsEngine).
         */
        get: operations["get_f60_status_users__user_id__f60_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{user_id}/verdict-accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Verdict Accuracy
         * @description H-08: per-user verdict accuracy detail. Alias of f60-status for compatibility.
         */
        get: operations["get_verdict_accuracy_users__user_id__verdict_accuracy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/metrics/user/{user_id}/wvpl": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get User Wvpl
         * @description Return rolling WVPL breakdowns for the last ``weeks`` KST weeks.
         *
         *     Response shape:
         *         {
         *           "user_id": "...",
         *           "weeks": [
         *             {"week_start": "...", "loop_count": N, "capture_n": ..., "search_n": ..., "verdict_n": ...},
         *             ...  # most-recent first
         *           ]
         *         }
         */
        get: operations["get_user_wvpl_metrics_user__user_id__wvpl_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/viz/route": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Route Viz Intent
         * @description Classify visualization intent and return template + data.
         *
         *     - WHY/STATE/EXECUTION: no search, returns capture context data.
         *     - SEARCH/COMPARE/FLOW: returns search_triggered=True + routing info.
         *       Client should follow up with GET /search/similar?capture_id=...
         */
        post: operations["route_viz_intent_viz_route_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/personalization/verdict": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Post Verdict
         * @description Record a verdict and return updated affinity score + threshold delta.
         *
         *     Cold-start users (n < 10) get mode="cold_start" with delta=null.
         *     Warm users (n ≥ 10) get mode="personalized" with computed delta.
         */
        post: operations["post_verdict_personalization_verdict_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/personalization/user/{user_id}/variant/{pattern_slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Variant
         * @description Resolve personalized (or global fallback) variant for user × pattern.
         */
        get: operations["get_variant_personalization_user__user_id__variant__pattern_slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/personalization/user/{user_id}/affinity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Affinity
         * @description Return top-k affinity scores for a user across all patterns.
         */
        get: operations["get_affinity_personalization_user__user_id__affinity_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/personalization/user/{user_id}/rescue/{pattern_slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Post Rescue
         * @description Manually trigger rescue for always-invalid patterns.
         *
         *     Returns rescued=False if needs_rescue check fails (valid_rate > 5% or n < 30).
         */
        post: operations["post_rescue_personalization_user__user_id__rescue__pattern_slug__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Validate Pattern
         * @description Run validate_and_gate() for a pattern slug.
         *
         *     Rate limit: 20/day per IP.
         *     503 if VALIDATION_PIPELINE_ENABLED=false.
         */
        post: operations["validate_pattern_research_validate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Discover
         * @description Trigger autonomous pattern discovery agent (W-0316).
         *
         *     Internal-only: requires x-engine-internal-secret header.
         *     Rate limit: 5/day. Discovery runs cost up to $0.50/cycle.
         *     503 if DISCOVERY_AGENT_ENABLED=false.
         */
        post: operations["discover_research_discover_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/autoresearch/trigger": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger Autoresearch
         * @description Manually trigger one autoresearch cycle (admin-only).
         *
         *     Requires X-API-Key header matching ENGINE_API_KEY env var.
         *     Returns immediately with run summary (runs synchronously in thread).
         */
        post: operations["trigger_autoresearch_research_autoresearch_trigger_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/signals/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Signals
         * @description Return active promoted signals for a symbol.
         *
         *     Filters to signals with expires_at > now AND promoted_at > now - lookback.
         */
        get: operations["get_signals_research_signals__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/runs/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Run
         * @description Return status of a specific autoresearch run.
         */
        get: operations["get_run_research_runs__run_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/findings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Findings
         * @description List inbox findings. date format: YYYY-MM-DD.
         */
        get: operations["list_findings_research_findings_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/alpha-quality": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Alpha Quality
         * @description GET /research/alpha-quality — Welch+BH-FDR+Spearman alpha quality report.
         */
        get: operations["get_alpha_quality_research_alpha_quality_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/market-search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Market Search
         * @description W-0365: Run pattern market search and return ranked candidates.
         */
        post: operations["market_search_research_market_search_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/indicator-features": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Indicator Features
         * @description W-0366: Return user-facing indicator feature catalog for UI.
         */
        get: operations["get_indicator_features_research_indicator_features_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/signals/{signal_id}/components": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Signal Components
         * @description GET /research/signals/{signal_id}/components — component_scores for a signal event.
         */
        get: operations["get_signal_components_research_signals__signal_id__components_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/top-patterns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Top Patterns */
        get: operations["get_top_patterns_research_top_patterns_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/formula-evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Formula Evidence
         * @description Return formula evidence rows sorted by drag_score DESC.
         *
         *     drag_score (bps) = blocked_winner_rate × avg_missed_pnl — how much
         *     alpha each filter rule has cost us in the last period_days.
         */
        get: operations["get_formula_evidence_research_formula_evidence_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/blocked-candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Blocked Candidates
         * @description Return blocked_candidates rows, optionally filtered by reason/symbol.
         */
        get: operations["get_blocked_candidates_research_blocked_candidates_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/rules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Rules
         * @description List research rules, optionally filtered by user_id / state.
         */
        get: operations["list_rules_research_rules_get"];
        put?: never;
        /**
         * Create Rule
         * @description Mode 2: Submit a user-authored trigger rule (proposed state).
         */
        post: operations["create_rule_research_rules_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/autoresearch/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Autoresearch Signals
         * @description Return recent top patterns promoted by autoresearch.
         *
         *     Used by Studio Workbench '발굴된 패턴' tab.
         *     Pulls from pattern_signals table ordered by sharpe desc.
         */
        get: operations["get_autoresearch_signals_research_autoresearch_signals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/autoresearch/targeted": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Targeted Autoresearch
         * @description Run a targeted autoresearch scan on a small symbol set.
         *
         *     Cost guardrails:
         *     - symbols cap: default 5, max 10
         *     - per-user/IP rate limit: 1 req / 5 min
         *     - 30 min result cache keyed by sha256(symbols + draft)
         *
         *     Does NOT write to pattern_signals or autoresearch_runs (save=False).
         *     AUTORESEARCH_ENABLED flag is bypassed — always runs when called.
         */
        post: operations["targeted_autoresearch_research_autoresearch_targeted_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/bucket-attribution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Bucket Attribution
         * @description Single-bucket detail — feeds `/research/buckets/[bucket_key]` (wireframe §B).
         */
        get: operations["get_bucket_attribution_research_bucket_attribution_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/research/bucket-attribution/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Bucket Attribution
         * @description Filtered list of buckets — feeds `/research/buckets` (wireframe §A).
         */
        get: operations["list_bucket_attribution_research_bucket_attribution_list_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/propfirm/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Summary */
        get: operations["get_summary_propfirm_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/propfirm/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Account */
        post: operations["create_account_propfirm_accounts_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/propfirm/payment/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm Payment
         * @description PENDING → ACTIVE 수동 전환.
         *     Stripe PI 상태 confirmed 후 evaluation을 ACTIVE로 업데이트.
         *     webhook 재시도 3회 실패 시 ops가 직접 호출.
         */
        post: operations["confirm_payment_propfirm_payment_confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/explain": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Explain */
        post: operations["explain_agent_explain_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/alpha-scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Alpha Scan */
        post: operations["alpha_scan_agent_alpha_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/similar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Similar */
        post: operations["similar_agent_similar_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/judge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Judge */
        post: operations["judge_agent_judge_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Save */
        post: operations["save_agent_save_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/chat/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Available Models
         * @description Return available models and route profiles filtered by configured API keys.
         */
        get: operations["get_available_models_agent_chat_models_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/chat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Agent Chat */
        post: operations["agent_chat_agent_chat_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/scratchpad": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Scratchpad Runs
         * @description List recent conversation-turn runs with per-run summary stats.
         *
         *     Auth: an authenticated caller only sees runs tagged with their user_id
         *     plus untagged runs. Anonymous callers see only untagged runs.
         *
         *     W-A270 — admin Scratchpad inspector listing surface; pairs with the
         *     existing per-run endpoint.
         */
        get: operations["list_scratchpad_runs_agent_scratchpad_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/scratchpad/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Scratchpad
         * @description Return the JSONL scratchpad trail for a single conversation turn (W-0494).
         *
         *     Auth: any authenticated user can read their own runs. Cross-user access is
         *     prevented by checking the ``user_id`` field on every entry.
         */
        get: operations["get_scratchpad_agent_scratchpad__run_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/trading-map/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Trading Map Preview
         * @description Preview the TradingMap context the agent would see for these inputs.
         */
        get: operations["trading_map_preview_agent_trading_map_preview_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/outcome-rag/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Outcome Rag Preview
         * @description Preview the Outcome RAG retrieval for a given (symbol, action, reason).
         */
        get: operations["outcome_rag_preview_agent_outcome_rag_preview_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/scan/universe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Universe Scan
         * @description Scan a universe of symbols for alpha signals.
         *
         *     Heavy endpoint — rate-limited to 10/minute. Runs scanner in a thread
         *     to avoid blocking the event loop.
         */
        post: operations["universe_scan_agent_scan_universe_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/scan/position-verdict": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Position Verdict
         * @description Evaluate an open position and return a recommended action.
         *
         *     Rate-limited to 30/minute. Runs verdict engine in a thread.
         */
        post: operations["position_verdict_agent_scan_position_verdict_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Alerts */
        get: operations["get_alerts_agent_alerts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/advisor-watches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Watches */
        get: operations["list_watches_agent_advisor_watches_get"];
        put?: never;
        /** Create Watch */
        post: operations["create_watch_agent_advisor_watches_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/advisor-watches/{watch_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Cancel Watch */
        delete: operations["cancel_watch_agent_advisor_watches__watch_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/advisor-watches/tick": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Tick Watches
         * @description Run one evaluation pass over all active watches.
         *
         *     Used both by the manual 시범 and by an external scheduler. The advisor and
         *     price fetchers are wired here so the core module stays dependency-free.
         */
        post: operations["tick_watches_agent_advisor_watches_tick_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/advisor-alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Alerts */
        get: operations["list_alerts_agent_advisor_alerts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/memories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Memories */
        get: operations["list_memories_agent_memories_get"];
        put?: never;
        /** Create Memory */
        post: operations["create_memory_agent_memories_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/memories/{memory_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Memory */
        delete: operations["delete_memory_agent_memories__memory_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/circuit-state": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Circuit State */
        get: operations["circuit_state_agent_circuit_state_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/altcoin/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Altcoin Scan */
        get: operations["get_altcoin_scan_agent_altcoin_scan_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/altcoin/orderbook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Altcoin Orderbook
         * @description Return orderbook depth snapshot with bucketed walls, TBuy, and optional position P&L.
         */
        get: operations["get_altcoin_orderbook_agent_altcoin_orderbook_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/prepump/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prepump Scan
         * @description Universe scan: runs pre-pump signal engine over all USDT perp pairs.
         *
         *     Rate-limited to 6/min (scan is heavy, ~10-20s for 400+ symbols).
         */
        get: operations["prepump_scan_agent_prepump_scan_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/prepump/single": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prepump Single
         * @description Single-symbol deep analysis with S01-S20 alpha signal map.
         *
         *     Runs run_single() and attaches compute_alpha_signals() output.
         */
        get: operations["prepump_single_agent_prepump_single_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/prepump/onchain": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prepump Onchain
         * @description On-chain context: Fear & Greed, Kimchi premium, SOPR, Netflow, GEX.
         *
         *     5-minute TTL cache — repeated calls within window are instant.
         */
        get: operations["prepump_onchain_agent_prepump_onchain_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/prepump/radar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prepump Radar
         * @description GOLDEN 4-condition poll over a custom watchlist (≤20 symbols).
         *
         *     Returns GoldenAlert entries: symbols that simultaneously pass all four
         *     conditions — FIRE tier, OI rising, LS_DIV≥0.30, Wyckoff≥5.
         */
        get: operations["prepump_radar_agent_prepump_radar_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/prepump/trades": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prepump Trades
         * @description Paper trade ledger — returns pre_spring_trades.json contents.
         *
         *     Splits records into open positions (FILLED / TP1_HIT) and closed
         *     positions (SL_HIT / TP2_HIT / EXPIRED) for easy front-end rendering.
         *     Computes summary stats (exposure, float PnL, open count, SL count).
         */
        get: operations["prepump_trades_agent_prepump_trades_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/prepump/radar-stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prepump Radar Stream
         * @description SSE: real-time Binance futures velocity + CVD/whale/squeeze radar.
         *
         *     Streams signal dicts as Server-Sent Events:
         *       {type, sym, value, price, ts, hot_label, signal_count_30m}
         *
         *     Signal types: VELOCITY | WHALE | CVD_BREAK | SQUEEZE
         *     HOT labels:   🔥 (≥10 signals/30min) | 🔴 (≥5) | (empty)
         *
         *     Rate-limited to 3/min — each connection opens Binance WebSocket streams.
         *     Disconnect to stop the radar.
         */
        get: operations["prepump_radar_stream_agent_prepump_radar_stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/signal-hub/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Signal Hub Scan
         * @description Universe scan — runs pre-pump / LPS / squeeze scorers over all USDT perps.
         *
         *     Rate-limited to 6/min (scan takes 15-30s for 400+ symbols).
         *     Returns symbols sorted by adjusted_score descending.
         */
        get: operations["signal_hub_scan_agent_signal_hub_scan_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/signal-hub/symbol/{sym}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Signal Hub Symbol
         * @description Single-symbol deep scan — runs all 3 scorers and returns full signal detail.
         */
        get: operations["signal_hub_symbol_agent_signal_hub_symbol__sym__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/signal-hub/decision-log": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Signal Hub Decision Log
         * @description Recent advisor decision log events.
         *
         *     Returns rows from advisor_decision_log (Supabase preferred, JSONL fallback).
         *     Each event: {ts, symbol, action, level, bias, score, reason, outcome_24h}.
         */
        get: operations["signal_hub_decision_log_agent_signal_hub_decision_log_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/signal-hub/ic-weights": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Signal Hub Ic Weights
         * @description Return current IC ensemble weights from disk.
         */
        get: operations["signal_hub_ic_weights_agent_signal_hub_ic_weights_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/krw/radar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Krw Listing Radar */
        get: operations["krw_listing_radar_agent_krw_radar_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/krw/premium": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Krw Premium */
        get: operations["krw_premium_agent_krw_premium_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/calendar/unlocks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Calendar Unlocks */
        get: operations["calendar_unlocks_agent_calendar_unlocks_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/news/digest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** News Digest */
        get: operations["news_digest_agent_news_digest_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Ai Context */
        get: operations["get_ai_context_ai_context_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/terminal/agent/context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Terminal Agent Context */
        get: operations["get_terminal_agent_context_terminal_agent_context_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/kill-switch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get State */
        get: operations["get_state_admin_kill_switch_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/kill-switch/arm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Arm */
        post: operations["arm_admin_kill_switch_arm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/kill-switch/disarm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Disarm */
        post: operations["disarm_admin_kill_switch_disarm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/passport/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Public Passport
         * @description Return public passport stats for a user by username.
         *
         *     Looks up user by username (display_name / nickname) from user_profiles.
         *     Returns 404 if not found or if the profile is set to private.
         */
        get: operations["get_public_passport_passport__username__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/extreme-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Extreme Events
         * @description Return recent extreme events from the JSONL event log.
         */
        get: operations["get_extreme_events_extreme_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/lab/counterfactual": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Counterfactual Review
         * @description Return blocked vs traded distribution data for counterfactual analysis.
         *
         *     This engine-side endpoint is a thin stub — the primary implementation lives
         *     in the SvelteKit API layer (`/api/lab/counterfactual`). This route is provided
         *     for direct engine consumers and internal tooling.
         *
         *     Returns an empty payload with `outcomes_available: false` when the
         *     `blocked_candidates` table is unavailable (e.g., local dev without W-0382
         *     migrations).
         */
        get: operations["get_counterfactual_review_lab_counterfactual_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/filter-drag": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Filter Drag
         * @description Return simulated result if filter threshold changed.
         *
         *     Read-only simulation — production thresholds are NOT mutated.
         *     The primary implementation lives in the SvelteKit API layer.
         */
        get: operations["get_filter_drag_patterns__slug__filter_drag_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/patterns/{slug}/formula": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Pattern Formula
         * @description Return pattern formula with buckets/evidence/suspect rows.
         *
         *     Read-only. The primary implementation lives in the SvelteKit API layer.
         *     Falls back to an empty payload when Supabase is unavailable.
         */
        get: operations["get_pattern_formula_patterns__slug__formula_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tv-import/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview
         * @description Fetch TV URL → cascade parse → compile → estimate.
         */
        post: operations["preview_tv_import_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tv-import/estimate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Estimate
         * @description Re-run estimate for a draft with a different strictness.
         */
        post: operations["estimate_tv_import_estimate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tv-import/commit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Commit
         * @description Commit draft → user_pattern_combos + idea_twin_links.
         */
        post: operations["commit_tv_import_commit_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tv-import/author/{username}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Author */
        get: operations["get_author_tv_import_author__username__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tv-import/twin/{import_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Twin */
        get: operations["get_twin_tv_import_twin__import_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agent/tv-fit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Agent Tv Fit */
        post: operations["agent_tv_fit_agent_tv_fit_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/indicators/catalog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Catalog
         * @description Return all registered indicators as a JSON list.
         */
        get: operations["get_catalog_indicators_catalog_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/indicators/series": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Series
         * @description Compute an indicator series for a symbol+timeframe.
         */
        get: operations["get_series_indicators_series_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/indicators/aggregated/{type}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Aggregated
         * @description Return a raw aggregated data series for a chart sub-pane.
         *
         *     Types:
         *       - funding  — 8h funding rate history (Binance /fapi/v1/fundingRate)
         *       - oi       — open interest (sumOpenInterest, hourly)
         *       - liq      — taker-buy ratio % (aggression proxy; falls back to LS ratio)
         *       - vol      — futures volume (hourly klines)
         *       - returns  — close pct_change (hourly klines)
         *
         *     Response: {"type": str, "symbol": str, "points": [{"t": ms, "v": float}], "count": int}
         */
        get: operations["get_aggregated_indicators_aggregated__type__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/scoring/active-model": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Active Model
         * @description Return the Layer C model status consumed by SearchLayerBadge.
         */
        get: operations["get_active_model_scoring_active_model_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/digest/digest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger Digest
         * @description POST /digest/run — trigger daily digest (called by Supabase cron or scheduler).
         */
        post: operations["trigger_digest_digest_digest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/digest/digest/opt-out/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Opt Out Digest
         * @description Mark user as opted-out of digest.
         */
        post: operations["opt_out_digest_digest_digest_opt_out__user_id__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/digest/digest/opt-in/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Opt In Digest
         * @description Re-enable digest for a user who opted out.
         */
        post: operations["opt_in_digest_digest_digest_opt_in__user_id__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cvd/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Multi-exchange CVD bars
         * @description Return last `limit` bars of 4-exchange aggregate CVD.
         *
         *     Fields per bar:
         *         ts        — bar open time (Unix ms)
         *         net       — CVD delta for this bar (buy_qty - sell_qty)
         *         cum       — cumulative CVD since daemon start
         *         vol_buy   — total taker buy volume this bar
         *         vol_sell  — total taker sell volume this bar
         *         exchanges — number of exchanges that contributed data (1–4)
         */
        get: operations["get_cvd_cvd__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cvd/{symbol}/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Latest CVD bar
         * @description Return the single most-recent CVD bar. Used by scanner for quick injection.
         */
        get: operations["get_cvd_latest_cvd__symbol__latest_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cvd-data/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Cvd */
        get: operations["get_cvd_cvd_data__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/liq-zones/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Liq Zones */
        get: operations["get_liq_zones_liq_zones__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/smc/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Smc Events
         * @description Return SMC events for a symbol/timeframe.
         */
        get: operations["get_smc_events_smc__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/basis": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Basis */
        get: operations["get_basis_basis_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/long-short": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Long Short */
        get: operations["get_long_short_long_short_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/macro/fomc": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Fomc */
        get: operations["get_fomc_macro_fomc_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/macro/cpi": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Cpi */
        get: operations["get_cpi_macro_cpi_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/macro/global": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Global Market */
        get: operations["get_global_market_macro_global_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/daily/venue-funding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Venue Funding
         * @description Latest funding rate snapshot across Binance, Bybit, OKX.
         */
        get: operations["get_venue_funding_daily_venue_funding_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/daily/coinbase-premium": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Coinbase Premium
         * @description Coinbase CPI (coinbase_close - binance_close) / binance_close.
         */
        get: operations["get_coinbase_premium_daily_coinbase_premium_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/daily/cme-cot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Cme Cot
         * @description Latest CFTC CME COT report — BTC/ETH open interest in base units.
         */
        get: operations["get_cme_cot_daily_cme_cot_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meme-coins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Meme Coins
         * @description List all CoinGecko meme-token coins with rank/mcap/trending.
         *
         *     Returns: [{symbol, coingecko_id, name, rank, mcap, price_change_24h, price_change_7d, is_trending}]
         *     Cached in-memory for 1 hour.
         */
        get: operations["list_meme_coins_meme_coins_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meme-coins/{symbol}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Meme Coin
         * @description Return meme metrics for a single Binance symbol (e.g. PEPEUSDT).
         *
         *     Returns 404 if the symbol is not in the CoinGecko meme universe.
         */
        get: operations["get_meme_coin_meme_coins__symbol__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Profile List
         * @description List available preset summaries (UI picker source).
         */
        get: operations["get_profile_list_api_profile_list_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/active": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Active Profile
         * @description Currently active profile (PR1 stub: always default).
         *
         *     PR3+ wires in `engine/runtime/active_profile.py` selection.
         */
        get: operations["get_active_profile_api_profile_active_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Profile By Name
         * @description Full profile dump by name.
         */
        get: operations["get_profile_by_name_api_profile__name__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wiki/user/{page}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Wiki Page */
        get: operations["get_wiki_page_wiki_user__page__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wiki/patterns/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Global Pattern Wiki */
        get: operations["get_global_pattern_wiki_wiki_patterns__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/wiki/user/patterns/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Pattern Wiki Page */
        get: operations["get_pattern_wiki_page_wiki_user_patterns__slug__get"];
        /** Put Pattern Wiki Page */
        put: operations["put_pattern_wiki_page_wiki_user_patterns__slug__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events/phase-transitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Phase Transitions Sse
         * @description Stream live scanner phase transition events as Server-Sent Events.
         */
        get: operations["phase_transitions_sse_events_phase_transitions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingest/nahonja": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest Nahonja */
        post: operations["ingest_nahonja_ingest_nahonja_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingest/alpha-terminal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest Alpha Terminal */
        post: operations["ingest_alpha_terminal_ingest_alpha_terminal_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingest/liqpressuremap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest Liqpressuremap */
        post: operations["ingest_liqpressuremap_ingest_liqpressuremap_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingest/alpha-hunter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest Alpha Hunter */
        post: operations["ingest_alpha_hunter_ingest_alpha_hunter_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ingest/kimp-wave": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest Kimp Wave */
        post: operations["ingest_kimp_wave_ingest_kimp_wave_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/market-context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Market Context */
        get: operations["get_market_context_market_context_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user-screener/parse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Parse
         * @description Validate DSL and return parsed conditions.
         */
        post: operations["parse_user_screener_parse_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user-screener/universe-scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Universe Scan
         * @description Evaluate DSL against the latest snapshot of each symbol.
         *
         *     Returns symbols meeting ALL conditions, sorted by score descending.
         */
        post: operations["universe_scan_user_screener_universe_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user-screener/backtest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Backtest
         * @description Historical multi-symbol DSL backtest with forward-return metrics.
         */
        post: operations["backtest_user_screener_backtest_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user-screener/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Signals
         * @description Return recent signal rows from user_screener_signals (service_role read).
         */
        get: operations["get_signals_user_screener_signals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user-screener/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Scan
         * @description Historical single-symbol scan (existing behaviour).
         */
        post: operations["scan_user_screener_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/analyze": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Advisor Analyze
         * @description Single-symbol: scan → bridge (with live funding/OI) → OrchestratorV3.
         */
        post: operations["advisor_analyze_advisor_analyze_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/analyze/mtf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Advisor Analyze Mtf
         * @description Single-symbol MTF cascade: 1d→4h→1h klines → OrchestratorMTF → decision.
         */
        post: operations["advisor_analyze_mtf_advisor_analyze_mtf_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/universe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Advisor Universe
         * @description Universe scan: top-N symbols → OrchestratorV3 → ranked decisions.
         */
        post: operations["advisor_universe_advisor_universe_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Decisions
         * @description Browse advisor_check decisions with filters.
         *
         *     Fields per row include: action, confidence, outcome_24h, correct (bool|None).
         */
        get: operations["advisor_decisions_advisor_decisions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Health
         * @description Data health: total decisions, pending backfill, oldest pending age.
         */
        get: operations["advisor_health_advisor_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/calibration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Calibration Status
         * @description Return current calibration threshold and win-rate stats (no DB required).
         */
        get: operations["advisor_calibration_status_advisor_calibration_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Metrics
         * @description Return advisor call metrics summary (last N records).
         */
        get: operations["advisor_metrics_advisor_metrics_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/secondary-model": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Secondary Model
         * @description Secondary meta-labeling model eval — latest snapshot.
         *
         *     W-A275 — reads the JSON snapshot written by the W-A230 secondary-model
         *     pipeline (``outcome.secondary_model.write_snapshot``). The dashboard
         *     surfaces the Phase U2 exit gate (IC IR > 0.4 on holdout) without
         *     re-training on the request path, since LightGBM training is too heavy
         *     for a synchronous HTTP handler.
         */
        get: operations["advisor_secondary_model_advisor_secondary_model_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/cost-burn": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Cost Burn
         * @description Advisor cost burn bucketed by hour/day with per-model breakdown.
         *
         *     W-A281 — exposes :func:`outcome.cost_burn.compute_cost_burn`. Lets the
         *     admin dashboard pace budget burn and catch cost spikes that an
         *     aggregate avg-cost view smooths over.
         */
        get: operations["advisor_cost_burn_advisor_cost_burn_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/parse-failure-timeseries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Parse Failure Timeseries
         * @description Advisor parse-failure rate bucketed by hour/day with per-model breakdown.
         *
         *     W-A282 — exposes
         *     :func:`outcome.parse_failure_timeseries.compute_parse_failure_timeseries`.
         *     A persistent rise in parse-failure rate for a specific model is a leading
         *     signal that prompt drift or a model regression is silently degrading
         *     advisor output quality.
         */
        get: operations["advisor_parse_failure_timeseries_advisor_parse_failure_timeseries_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/symbol-mix": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Symbol Mix
         * @description Top symbols by advisor-decision count, with per-symbol action breakdown.
         *
         *     W-A280 — exposes :func:`outcome.symbol_mix.compute_symbol_mix`. Surfaces
         *     universe drift (the agent collapsing onto a handful of symbols) and
         *     per-symbol behavior bias that aggregates hide.
         */
        get: operations["advisor_symbol_mix_advisor_symbol_mix_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/latency-timeseries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Latency Timeseries
         * @description Advisor latency p50/p95/p99 bucketed by hour or day.
         *
         *     W-A278 — exposes :func:`outcome.latency_timeseries.compute_latency_timeseries`.
         *     Tail-latency regressions are invisible in a single aggregate p50; a
         *     bucketed time-series surfaces them as soon as a bucket flips.
         */
        get: operations["advisor_latency_timeseries_advisor_latency_timeseries_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/rolling-accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Rolling Accuracy
         * @description Daily + trailing-window accuracy time-series for directional decisions.
         *
         *     W-A286 — exposes
         *     :func:`outcome.rolling_accuracy.compute_rolling_accuracy`. A creeping
         *     decline that the 30-day aggregate hides shows up clearly in a
         *     7-day rolling line.
         */
        get: operations["advisor_rolling_accuracy_advisor_rolling_accuracy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-trend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Advisor Confidence Trend
         * @description Daily confidence mean / median with rolling-window mean.
         *
         *     W-A291 — exposes
         *     :func:`outcome.confidence_trend.compute_confidence_trend`. Surfaces
         *     creeping shifts in assertiveness that the window aggregate hides.
         */
        get: operations["advisor_confidence_trend_advisor_confidence_trend_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * advisor_check decision quality — hit-rate per action + calibration buckets.
         * @description advisor_check decision quality — hit-rate per action + calibration buckets.
         */
        get: operations["advisor_accuracy_advisor_accuracy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-confidence-heatmap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cross-tab of action vs confidence bucket.
         * @description Cross-tab of action vs confidence bucket.
         */
        get: operations["advisor_action_confidence_heatmap_advisor_action_confidence_heatmap_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-mix-by-dow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-weekday breakdown of advisor action shares.
         * @description Per UTC-weekday breakdown of advisor action shares.
         */
        get: operations["advisor_action_mix_by_dow_advisor_action_mix_by_dow_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-mix-by-hour": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-hour breakdown of advisor action shares.
         * @description Per UTC-hour breakdown of advisor action shares.
         */
        get: operations["advisor_action_mix_by_hour_advisor_action_mix_by_hour_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-mix-by-symbol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol breakdown of advisor action shares.
         * @description Per-symbol breakdown of advisor action shares.
         */
        get: operations["advisor_action_mix_by_symbol_advisor_action_mix_by_symbol_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-mix-trend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-day shares of each action over the window.
         * @description Per-day shares of each action over the window.
         */
        get: operations["advisor_action_mix_trend_advisor_action_mix_trend_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-reversal-latency": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Time between directional decision and the next opposite-direction one.
         * @description Time between directional decision and the next opposite-direction one.
         */
        get: operations["advisor_action_reversal_latency_advisor_action_reversal_latency_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/action-transitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Action transition matrix (prev → next) computed per symbol.
         * @description Action transition matrix (prev → next) computed per symbol.
         */
        get: operations["advisor_action_transitions_advisor_action_transitions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-by-action": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-action confidence distribution (mean / median / p10 / p90 / min / max).
         * @description Per-action confidence distribution (mean / median / p10 / p90 / min / max).
         */
        get: operations["advisor_confidence_by_action_advisor_confidence_by_action_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-histogram": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Confidence-value distribution across decisions over a window.
         * @description Confidence-value distribution across decisions over a window.
         */
        get: operations["advisor_confidence_histogram_advisor_confidence_histogram_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-outcome-bands": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Mean/median outcome_24h per confidence band × action.
         * @description Mean/median outcome_24h per confidence band × action.
         */
        get: operations["advisor_confidence_outcome_bands_advisor_confidence_outcome_bands_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-outcome-correlation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pearson r between confidence and outcome (signed & absolute) + per-bucket stats.
         * @description Pearson r between confidence and outcome (signed & absolute) + per-bucket stats.
         */
        get: operations["advisor_confidence_outcome_correlation_advisor_confidence_outcome_correlation_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-quantiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Overall + per-symbol quantile distribution of advisor confidence.
         * @description Overall + per-symbol quantile distribution of advisor confidence.
         */
        get: operations["advisor_confidence_quantiles_advisor_confidence_quantiles_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/confidence-ttl-correlation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pearson r between confidence and ttl_hours + per-confidence-bucket TTL stats.
         * @description Pearson r between confidence and ttl_hours + per-confidence-bucket TTL stats.
         */
        get: operations["advisor_confidence_ttl_correlation_advisor_confidence_ttl_correlation_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/day-of-week-accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-UTC-weekday hit_rate of directional advisor decisions.
         * @description Per-UTC-weekday hit_rate of directional advisor decisions.
         */
        get: operations["advisor_day_of_week_accuracy_advisor_day_of_week_accuracy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/day-of-week-confidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Mean confidence per UTC weekday.
         * @description Mean confidence per UTC weekday.
         */
        get: operations["advisor_day_of_week_confidence_advisor_day_of_week_confidence_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/day-of-week-decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 7-day-of-week UTC histogram of advisor decisions with action split.
         * @description 7-day-of-week UTC histogram of advisor decisions with action split.
         */
        get: operations["advisor_day_of_week_decisions_advisor_day_of_week_decisions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/decision-density-heatmap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 7-day × 24-hour UTC heatmap of advisor decision counts.
         * @description 7-day × 24-hour UTC heatmap of advisor decision counts.
         */
        get: operations["advisor_decision_density_heatmap_advisor_decision_density_heatmap_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/decision-interarrival": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Gap distribution between consecutive advisor decisions.
         * @description Gap distribution between consecutive advisor decisions.
         */
        get: operations["advisor_decision_interarrival_advisor_decision_interarrival_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/decision-streak-per-symbol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol longest run of consecutive same-action decisions.
         * @description Per-symbol longest run of consecutive same-action decisions.
         */
        get: operations["advisor_decision_streak_per_symbol_advisor_decision_streak_per_symbol_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/decision-volume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Daily decision counts by action over a window.
         * @description Daily decision counts by action over a window.
         */
        get: operations["advisor_decision_volume_advisor_decision_volume_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/hour-of-day-accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-UTC-hour hit_rate of directional advisor decisions.
         * @description Per-UTC-hour hit_rate of directional advisor decisions.
         */
        get: operations["advisor_hour_of_day_accuracy_advisor_hour_of_day_accuracy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/hour-of-day-confidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Mean confidence per UTC hour.
         * @description Mean confidence per UTC hour.
         */
        get: operations["advisor_hour_of_day_confidence_advisor_hour_of_day_confidence_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/hour-of-day-decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 24h UTC histogram of advisor decisions with per-action breakdown.
         * @description 24h UTC histogram of advisor decisions with per-action breakdown.
         */
        get: operations["advisor_hour_of_day_decisions_advisor_hour_of_day_decisions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ic": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Outcome IC baseline — Spearman correlation between advisor confidence
         * @description Outcome IC baseline — Spearman correlation between advisor confidence
         */
        get: operations["advisor_ic_advisor_ic_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/keep-rate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Keep Rate baseline — fraction of NEW_ENTRY calls with non-negative outcome.
         * @description Keep Rate baseline — fraction of NEW_ENTRY calls with non-negative outcome.
         */
        get: operations["advisor_keep_rate_advisor_keep_rate_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/label-coverage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Triple-barrier label coverage snapshot.
         * @description Triple-barrier label coverage snapshot.
         */
        get: operations["advisor_label_coverage_advisor_label_coverage_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/net-sharpe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Net Sharpe baseline — gross/net Sharpe + cost-eaten ratio.
         * @description Net Sharpe baseline — gross/net Sharpe + cost-eaten ratio.
         */
        get: operations["advisor_net_sharpe_advisor_net_sharpe_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-magnitude": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Histogram of realized outcome_24h returns with per-action split.
         * @description Histogram of realized outcome_24h returns with per-action split.
         */
        get: operations["advisor_outcome_magnitude_advisor_outcome_magnitude_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-magnitude-by-action": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-action |outcome_24h| stats (mean, median, p90, signed mean, pos_share).
         * @description Per-action |outcome_24h| stats (mean, median, p90, signed mean, pos_share).
         */
        get: operations["advisor_outcome_magnitude_by_action_advisor_outcome_magnitude_by_action_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-magnitude-by-dow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-weekday magnitude distribution of |outcome_24h|.
         * @description Per UTC-weekday magnitude distribution of |outcome_24h|.
         */
        get: operations["advisor_outcome_magnitude_by_dow_advisor_outcome_magnitude_by_dow_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-magnitude-by-hour": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-hour magnitude distribution of |outcome_24h|.
         * @description Per UTC-hour magnitude distribution of |outcome_24h|.
         */
        get: operations["advisor_outcome_magnitude_by_hour_advisor_outcome_magnitude_by_hour_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-magnitude-by-symbol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol distribution of realized |outcome_24h|.
         * @description Per-symbol distribution of realized |outcome_24h|.
         */
        get: operations["advisor_outcome_magnitude_by_symbol_advisor_outcome_magnitude_by_symbol_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-sign-by-action": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-action distribution of realized outcome direction.
         * @description Per-action distribution of realized outcome direction.
         */
        get: operations["advisor_outcome_sign_by_action_advisor_outcome_sign_by_action_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-sign-by-dow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-UTC-weekday distribution of realized outcome direction.
         * @description Per-UTC-weekday distribution of realized outcome direction.
         */
        get: operations["advisor_outcome_sign_by_dow_advisor_outcome_sign_by_dow_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-sign-by-hour": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-hour outcome direction distribution (pos / neg / zero).
         * @description Per UTC-hour outcome direction distribution (pos / neg / zero).
         */
        get: operations["advisor_outcome_sign_by_hour_advisor_outcome_sign_by_hour_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/outcome-sign-by-symbol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol distribution of realized outcome direction.
         * @description Per-symbol distribution of realized outcome direction.
         */
        get: operations["advisor_outcome_sign_by_symbol_advisor_outcome_sign_by_symbol_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/per-symbol-accuracy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol directional accuracy with min-sample-size filter.
         * @description Per-symbol directional accuracy with min-sample-size filter.
         */
        get: operations["advisor_per_symbol_accuracy_advisor_per_symbol_accuracy_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/per-symbol-confidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol confidence distribution (mean/median/stdev/min/max).
         * @description Per-symbol confidence distribution (mean/median/stdev/min/max).
         */
        get: operations["advisor_per_symbol_confidence_advisor_per_symbol_confidence_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/per-symbol-recency": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Hours since most recent advisor decision per symbol.
         * @description Hours since most recent advisor decision per symbol.
         */
        get: operations["advisor_per_symbol_recency_advisor_per_symbol_recency_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/per-symbol-refusal-rate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol share of REFUSAL decisions.
         * @description Per-symbol share of REFUSAL decisions.
         */
        get: operations["advisor_per_symbol_refusal_rate_advisor_per_symbol_refusal_rate_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/reference-price-drift": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol drift of advisor reference_price across decisions.
         * @description Per-symbol drift of advisor reference_price across decisions.
         */
        get: operations["advisor_reference_price_drift_advisor_reference_price_drift_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/refusal-rate-by-dow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-weekday REFUSAL action share among all decisions.
         * @description Per UTC-weekday REFUSAL action share among all decisions.
         */
        get: operations["advisor_refusal_rate_by_dow_advisor_refusal_rate_by_dow_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/refusal-rate-by-hour": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-hour REFUSAL action share among all decisions.
         * @description Per UTC-hour REFUSAL action share among all decisions.
         */
        get: operations["advisor_refusal_rate_by_hour_advisor_refusal_rate_by_hour_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/stale-decision-backlog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Age distribution of unlabeled advisor decisions.
         * @description Age distribution of unlabeled advisor decisions.
         */
        get: operations["advisor_stale_decision_backlog_advisor_stale_decision_backlog_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/symbol-churn-rate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Set-overlap churn between first and second half of window.
         * @description Set-overlap churn between first and second half of window.
         */
        get: operations["advisor_symbol_churn_rate_advisor_symbol_churn_rate_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/symbol-concentration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Herfindahl concentration of advisor decisions across symbols.
         * @description Herfindahl concentration of advisor decisions across symbols.
         */
        get: operations["advisor_symbol_concentration_advisor_symbol_concentration_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ttl-by-action": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-action ttl_hours stats (mean, median, p90, min, max).
         * @description Per-action ttl_hours stats (mean, median, p90, min, max).
         */
        get: operations["advisor_ttl_by_action_advisor_ttl_by_action_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ttl-by-dow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-weekday statistics of advisor-chosen ttl_hours.
         * @description Per UTC-weekday statistics of advisor-chosen ttl_hours.
         */
        get: operations["advisor_ttl_by_dow_advisor_ttl_by_dow_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ttl-by-hour": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per UTC-hour TTL statistics (mean / median / p90 / min / max).
         * @description Per UTC-hour TTL statistics (mean / median / p90 / min / max).
         */
        get: operations["advisor_ttl_by_hour_advisor_ttl_by_hour_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ttl-by-symbol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Per-symbol mean/median advisor TTL hours.
         * @description Per-symbol mean/median advisor TTL hours.
         */
        get: operations["advisor_ttl_by_symbol_advisor_ttl_by_symbol_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ttl-distribution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Histogram of advisor decision TTL hours with per-action breakdown.
         * @description Histogram of advisor decision TTL hours with per-action breakdown.
         */
        get: operations["advisor_ttl_distribution_advisor_ttl_distribution_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/advisor/ttl-outcome-correlation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pearson r between ttl_hours and |outcome_24h| + per-TTL-bucket stats.
         * @description Pearson r between ttl_hours and |outcome_24h| + per-TTL-bucket stats.
         */
        get: operations["advisor_ttl_outcome_correlation_advisor_ttl_outcome_correlation_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/turns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Turns */
        get: operations["list_turns_turns_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/turns/approval": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Approvals
         * @description List approval tokens, optionally filtered by status (PENDING/CONFIRMED/…).
         *
         *     Used by the user-facing Approval Inbox surface (W-A257 / W-A200 R13).
         */
        get: operations["list_approvals_turns_approval_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/turns/{turn_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Turn */
        get: operations["get_turn_turns__turn_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/turns/{turn_id}/replay": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Replay Turn */
        post: operations["replay_turn_turns__turn_id__replay_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/turns/approval/{token_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Approval */
        get: operations["get_approval_turns_approval__token_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/turns/approval/{token_id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm Approval */
        post: operations["confirm_approval_turns_approval__token_id__confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/pattern_scan/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Pattern Scan
         * @description Cloud Scheduler → trigger pattern state machine scan.
         */
        post: operations["run_pattern_scan_jobs_pattern_scan_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/outcome_resolver/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Outcome Resolver
         * @description Cloud Scheduler → run outcome resolution for pending captures.
         */
        post: operations["run_outcome_resolver_jobs_outcome_resolver_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/auto_capture/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Auto Capture
         * @description Cloud Scheduler → capture current pattern candidates.
         */
        post: operations["run_auto_capture_jobs_auto_capture_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/market_search_index_refresh/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Market Search Index Refresh
         * @description Cloud Scheduler → rebuild the local market search index.
         */
        post: operations["run_market_search_index_refresh_jobs_market_search_index_refresh_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/db_cleanup/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Db Cleanup
         * @description Cloud Scheduler (daily) → purge stale rows from high-growth tables.
         *
         *     Retention policy:
         *       engine_alerts            →  7 days  (scan signals, replaced each cycle)
         *       opportunity_scans        →  7 days  (per-table comment: 7d recommended)
         *       terminal_pattern_captures → 90 days (user data: longer retention)
         */
        post: operations["run_db_cleanup_jobs_db_cleanup_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/feature_windows_build/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Feature Windows Build
         * @description Cloud Scheduler → rebuild FeatureWindowStore from local CSV cache.
         *
         *     Runs every 6 hours (BINANCE_30 × [15m, 1h, 4h], 90 days history).
         *     Idempotent: UPSERT only writes bars not already stored.
         *
         *     W-0476 PR1: dispatched fire-and-forget (returns 202 + run_id ≤2s).
         */
        post: operations["run_feature_windows_build_jobs_feature_windows_build_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/feature_materialization/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Feature Materialization
         * @description Cloud Scheduler → materialize canonical feature_windows for universe.
         *
         *     Reads from existing local cache (offline=True) — never fans out to providers.
         *     Produces feature_windows, pattern_events, search_corpus_signatures in
         *     engine/state/feature_materialization.sqlite.
         */
        post: operations["run_feature_materialization_jobs_feature_materialization_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/raw_ingest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Raw Ingest
         * @description Cloud Scheduler → ingest raw market data for universe into canonical raw store.
         *
         *     Fetches from Binance and writes raw_market_bars, raw_perp_metrics,
         *     raw_orderflow_metrics into engine/state/canonical_raw.sqlite.
         *     Also refreshes the legacy CSV cache so downstream jobs stay in sync.
         */
        post: operations["run_raw_ingest_jobs_raw_ingest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/cvd_build/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Cvd Build
         * @description Cloud Scheduler → compute CVD from existing OHLCV klines.
         */
        post: operations["run_cvd_build_jobs_cvd_build_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/liq_zones/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Liq Zones
         * @description Cloud Scheduler → aggregate liquidation events into price cluster zones.
         */
        post: operations["run_liq_zones_jobs_liq_zones_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/basis_build/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Basis Build
         * @description Cloud Scheduler (every 2h) → fetch spot-perp basis for universe and write to parquet.
         */
        post: operations["run_basis_build_jobs_basis_build_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/smc_scan/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Smc Scan
         * @description Cloud Scheduler → run SMC detection for universe symbols.
         */
        post: operations["run_smc_scan_jobs_smc_scan_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/hourly_ingest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Hourly Ingest
         * @description Cloud Scheduler (hourly at :05) → fetch incremental klines for universe → ParquetStore + GCS ohlcv/.
         */
        post: operations["run_hourly_ingest_jobs_hourly_ingest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/pump_universe_klines/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Pump Universe Klines
         * @description Binance USDT spot 1h candles for full listing universe → Supabase raw_binance_usdt_kline_1h.
         */
        post: operations["run_pump_universe_klines_jobs_pump_universe_klines_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/pump_precursor_scan/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Pump Precursor Scan
         * @description Kline precursor features + optional classifier score → pump_precursor_features.
         */
        post: operations["run_pump_precursor_scan_jobs_pump_precursor_scan_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/backtest_refresh/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Backtest Refresh
         * @description Cloud Scheduler (daily 03:30 UTC) → compute backtest stats for all patterns → Supabase.
         *
         *     W-0476 PR1: ≤2hr workload — fire-and-forget (was sync, would never complete).
         */
        post: operations["run_backtest_refresh_jobs_backtest_refresh_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/backfill_signals/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Backfill Signals
         * @description One-time historical backfill: populate scan_signal_events + scan_signal_outcomes.
         *
         *     Runs all PATTERN_LIBRARY patterns against the full scan universe (or max_symbols
         *     if set) for the last `days` days. Writes directly to Supabase via upsert.
         *     Returns 202 immediately; actual work runs in a background thread pool (4 workers).
         *
         *     Safe to call repeatedly — upserts are idempotent.
         */
        post: operations["run_backfill_signals_jobs_backfill_signals_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/market_context_refresh/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Market Context Refresh
         * @description Cloud Scheduler (*\/15 * * * *) → pre-compute market context for universe → Redis (TTL=900s).
         *
         *     W-0476 PR1: fan-out across universe — fire-and-forget.
         */
        post: operations["run_market_context_refresh_jobs_market_context_refresh_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/pipeline_runs_cleanup/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Pipeline Runs Cleanup
         * @description Cloud Scheduler (hourly) → mark stale `pipeline_runs.status='running'` rows as 'timeout'.
         *
         *     W-0476 PR2: Cloud Run instance kill (deploy / scale-down) can leave fire-and-forget
         *     rows orphaned in 'running'. This sweep keeps the table interpretable. The sweep
         *     is fast (single UPDATE) so it runs synchronously inside `_run_with_guard`.
         */
        post: operations["run_pipeline_runs_cleanup_jobs_pipeline_runs_cleanup_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t1_ingest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T1 Ingest
         * @description W-0496 PR4 — T1 ingestion: funding/OI/LS ratio (Binance), Korean tickers, mempool.
         *
         *     Fire-and-forget. Writes to raw_funding_rate, raw_open_interest, raw_long_short_ratio,
         *     raw_upbit_ticker, raw_bithumb_ticker, raw_coinbase_premium, raw_btc_mempool.
         *     All sources are free public APIs — no API key required.
         */
        post: operations["run_t1_ingest_jobs_t1_ingest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t2_ingest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T2 Ingest
         * @description W-0496 PR5 — T2 ingestion: BTC on-chain (blockchain.info) + stablecoin mcap (DefiLlama).
         *
         *     Writes to raw_active_addresses, raw_tx_count, raw_fees, raw_stablecoin_metrics.
         */
        post: operations["run_t2_ingest_jobs_t2_ingest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t2_coinmetrics/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T2 Coinmetrics
         * @description W-0496 PR9 — T2 CoinMetrics on-chain: MVRV/NUPL/Realized Price/NVT from papers.
         *
         *     Sources: CoinMetrics community free API + blockchain.info + CoinGecko.
         *     Derives NUPL (Shirakashi 2019), Realized Cap/Price (Adamant 2018), NVT (Willy Woo 2017).
         *     Writes to raw_mvrv, raw_nupl, raw_realized_price, raw_nvt,
         *              raw_active_addresses (BTC), raw_miner_metrics (BTC).
         */
        post: operations["run_t2_coinmetrics_jobs_t2_coinmetrics_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t2_bigquery/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T2 Bigquery
         * @description T2 BigQuery on-chain: BTC miner outflow + exchange reserve + ETH staking.
         *
         *     Uses bigquery-public-data (no custom table costs).
         *     Cloud Run: Workload Identity — no credentials file needed.
         *     Writes to raw_miner_metrics, raw_exchange_flow, raw_active_addresses.
         */
        post: operations["run_t2_bigquery_jobs_t2_bigquery_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t3_gecko/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T3 Gecko
         * @description W-0496 PR9 — T3 GeckoTerminal: trending + new DEX pools (free API).
         *
         *     Writes to raw_gecko_pools.
         */
        post: operations["run_t3_gecko_jobs_t3_gecko_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t3_ingest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T3 Ingest
         * @description W-0496 PR6 — T3 ingestion: TVL global/chain/protocol + DEX metrics (DefiLlama).
         *
         *     Writes to raw_tvl_global, raw_tvl_chain, raw_tvl_protocol, raw_dex_metrics.
         */
        post: operations["run_t3_ingest_jobs_t3_ingest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/t4_ingest/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run T4 Ingest
         * @description W-0496 PR7 — T4 ingestion: Fear&Greed (alternative.me) + token supply (CoinGecko).
         *
         *     Writes to raw_fear_greed, raw_token_supply.
         */
        post: operations["run_t4_ingest_jobs_t4_ingest_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/weekly_ingest_cot/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Weekly Ingest Cot
         * @description Cloud Scheduler (weekly Saturday 23:00 UTC) — CFTC COT → ParquetStore + Supabase raw_cme_metrics.
         *
         *     Free CFTC Socrata API. Writes BTC+ETH CME OI (base-asset units) to raw_cme_metrics.
         */
        post: operations["run_weekly_ingest_cot_jobs_weekly_ingest_cot_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/daily_ingest_macro/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Daily Ingest Macro
         * @description Cloud Scheduler (daily 02:30 UTC) → fetch all macro signals → macro_features Supabase table.
         *
         *     W-0516: replaces APScheduler-only wiring. Fetches Fear&Greed, Yahoo (DXY/VIX/SPX),
         *     BTC dominance, FRED (DFF/DGS10/PCE/RRP), TGA, Coinbase premium.
         *     Also writes to ParquetStore for legacy compatibility.
         */
        post: operations["run_daily_ingest_macro_jobs_daily_ingest_macro_run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/data_lake/freshness": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Data Lake Freshness
         * @description W-0496 PR8 — Return Supabase-backed dataset freshness for the data lake.
         *
         *     W-A108 P1: the canonical source of dataset freshness now lives in
         *     `data_lake.query.FreshnessRepository`. This endpoint remains as the
         *     Supabase/data-lake slice for compatibility.
         */
        get: operations["data_lake_freshness_jobs_data_lake_freshness_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Jobs Status
         * @description Return resource guard state for all managed jobs.
         *
         *     Auth: bearer SCHEDULER_SECRET (W-0468 PR4).
         */
        get: operations["jobs_status_jobs_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/freshness": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Jobs Freshness
         * @description Return dataset-centric freshness across canonical storage backends.
         *
         *     W-A108 P1: this endpoint now reports both canonical parquet datasets and
         *     Supabase-backed data-lake datasets via `FreshnessRepository`.
         */
        get: operations["jobs_freshness_jobs_freshness_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/jobs/{job_name}/run": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Run Plugin Job
         * @description Generic dispatch for plugin jobs registered in scanner.jobs.registry.
         *
         *     Accepts the same auth as all other /jobs/* endpoints. Only jobs that
         *     were registered via scanner.jobs.registry.register() are reachable here;
         *     hard-wired jobs (pattern_scan, hourly_ingest, etc.) have dedicated
         *     endpoints and are not exposed through this handler.
         *
         *     Auth: bearer SCHEDULER_SECRET or Google OIDC (W-0468 PR2).
         */
        post: operations["run_plugin_job_jobs__job_name__run_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Healthz */
        get: operations["healthz_healthz_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/readyz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Readyz */
        get: operations["readyz_readyz_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Metrics */
        get: operations["metrics_metrics_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/scanner/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Scanner Status */
        get: operations["scanner_status_scanner_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** ActiveModelResponse */
        ActiveModelResponse: {
            /** Status */
            status: string;
            /** Version */
            version?: string | null;
            /** Training Size */
            training_size?: number | null;
            /** Ndcg At 5 */
            ndcg_at_5?: number | null;
            /** Ci Lower */
            ci_lower?: number | null;
            /**
             * Lgbm Weight
             * @default 0
             */
            lgbm_weight: number;
        };
        /** AffinityEntry */
        AffinityEntry: {
            /** Pattern Slug */
            pattern_slug: string;
            /** Alpha Valid */
            alpha_valid: number;
            /** Beta Valid */
            beta_valid: number;
            /** N Total */
            n_total: number;
            /** Score */
            score: number;
            /** Is Cold */
            is_cold: boolean;
            /** Updated At */
            updated_at: string;
        };
        /** AffinityListResponse */
        AffinityListResponse: {
            /** User Id */
            user_id: string;
            /** Patterns */
            patterns: components["schemas"]["AffinityEntry"][];
        };
        /** AgentResponse */
        AgentResponse: {
            /** Text */
            text: string;
            /** Cmd */
            cmd: string;
            /** Latency Ms */
            latency_ms: number;
            /** Provider */
            provider: string;
        };
        /** AlphaHunterBatch */
        AlphaHunterBatch: {
            /** Transitions */
            transitions: components["schemas"]["StageTransitionPayload"][];
        };
        /** AlphaScanRequest */
        AlphaScanRequest: {
            /** Scores */
            scores: {
                [key: string]: unknown;
            }[];
            /**
             * Top N
             * @default 5
             */
            top_n: number;
            /** User Id */
            user_id?: string | null;
        };
        /** AlphaTerminalBatch */
        AlphaTerminalBatch: {
            /** Payloads */
            payloads: {
                [key: string]: unknown;
            }[];
        };
        /** AnalyzeRequest */
        AnalyzeRequest: {
            /**
             * Symbol
             * @default BTCUSDT
             */
            symbol: string;
            /**
             * Question
             * @default
             */
            question: string;
            /**
             * User Id
             * @default engine
             */
            user_id: string;
            /**
             * Equity Usd
             * @default 10000
             */
            equity_usd: number;
        };
        /** AnomalyFlag */
        AnomalyFlag: {
            /** Severity */
            severity: string;
            /** Description */
            description: string;
        };
        /** ArmRequest */
        ArmRequest: {
            /** Reason */
            reason: string;
            /** Actor */
            actor?: string | null;
        };
        /** AutoresearchSignalItem */
        AutoresearchSignalItem: {
            /** Symbol */
            symbol: string;
            /** Pattern */
            pattern: string;
            /** Timeframe */
            timeframe: string;
            /** Sharpe */
            sharpe: number | null;
            /** Hit Rate */
            hit_rate: number | null;
            /** N Trades */
            n_trades: number | null;
            /** Expectancy */
            expectancy: number | null;
            /** Max Dd */
            max_dd: number | null;
            /** Run Bucket */
            run_bucket: string;
        };
        /** AutoresearchSignalsResponse */
        AutoresearchSignalsResponse: {
            /** Signals */
            signals: components["schemas"]["AutoresearchSignalItem"][];
            /** Count */
            count: number;
        };
        /** AutoresearchTriggerResponse */
        AutoresearchTriggerResponse: {
            /** Status */
            status: string;
            /** Run Id */
            run_id?: string | null;
            /** N Symbols */
            n_symbols?: number | null;
            /** N Promoted */
            n_promoted?: number | null;
            /** N Written */
            n_written?: number | null;
            /** Elapsed S */
            elapsed_s?: number | null;
            /** Reason */
            reason?: string | null;
            /** Error */
            error?: string | null;
        };
        /** BacktestConfig */
        BacktestConfig: {
            /**
             * Stop Loss
             * @default 0.02
             */
            stop_loss: number;
            /**
             * Take Profit
             * @default 0.04
             */
            take_profit: number;
            /**
             * Timeout Bars
             * @default 24
             */
            timeout_bars: number;
            /**
             * Universe
             * @default binance_30
             */
            universe: string;
        };
        /** BacktestMetrics */
        BacktestMetrics: {
            /** N Trades */
            n_trades: number;
            /** Win Rate */
            win_rate: number;
            /** Expectancy */
            expectancy: number;
            /** Profit Factor */
            profit_factor: number;
            /** Max Drawdown */
            max_drawdown: number;
            /** Sortino */
            sortino: number;
            /** Walk Forward Pass Rate */
            walk_forward_pass_rate: number;
        };
        /** BacktestResponse */
        BacktestResponse: {
            metrics: components["schemas"]["BacktestMetrics"];
            /** Passed */
            passed: boolean;
            /** Gate Failures */
            gate_failures: string[];
        };
        /** BlockSet */
        BlockSet: {
            /** Triggers */
            triggers?: string[];
            /** Confirmations */
            confirmations?: string[];
            /** Entries */
            entries?: string[];
            /** Disqualifiers */
            disqualifiers?: string[];
        };
        /** BlockedCandidateItem */
        BlockedCandidateItem: {
            /** Id */
            id?: string | null;
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /** Direction */
            direction?: string | null;
            /** Reason */
            reason?: string | null;
            /** Score */
            score?: number | null;
            /** P Win */
            p_win?: number | null;
            /** Source */
            source?: string | null;
            /** Pattern Slug */
            pattern_slug?: string | null;
            /** Forward 1H */
            forward_1h?: number | null;
            /** Forward 4H */
            forward_4h?: number | null;
            /** Forward 24H */
            forward_24h?: number | null;
            /** Forward 72H */
            forward_72h?: number | null;
            /** Blocked At */
            blocked_at?: string | null;
        };
        /** BucketAttributionResponse */
        BucketAttributionResponse: {
            /** Bucket Key */
            bucket_key: string;
            state: components["schemas"]["BucketStateOut"];
            /** Modes */
            modes: {
                [key: string]: components["schemas"]["ModeStatusOut"];
            };
            pooling_chain: components["schemas"]["PoolingChainOut"];
            /** Recent Trades */
            recent_trades: components["schemas"]["RecentTradeOut"][];
            /** Conflict */
            conflict: boolean;
        };
        /**
         * BucketListItem
         * @description Light row for list endpoint — no recent_trades.
         */
        BucketListItem: {
            /** Bucket Key */
            bucket_key: string;
            state: components["schemas"]["BucketStateOut"];
            /** Modes */
            modes: {
                [key: string]: components["schemas"]["ModeStatusOut"];
            };
            /** Conflict */
            conflict: boolean;
        };
        /** BucketStateOut */
        BucketStateOut: {
            /** N */
            n: number;
            /** Wins */
            wins: number;
            /** Losses */
            losses: number;
            /** Tp1 Count */
            tp1_count: number;
            /** Tp2 Count */
            tp2_count: number;
            /** Tp3 Count */
            tp3_count: number;
            /** Stop Count */
            stop_count: number;
            /** Time Count */
            time_count: number;
            /** Posterior Mean */
            posterior_mean: number | null;
            /** Posterior Lcb95 */
            posterior_lcb95: number | null;
            /** Pool Weight */
            pool_weight: number | null;
            /** Stop Rate */
            stop_rate: number;
            /** Tp Rate */
            tp_rate: number;
        };
        /** BulkImportBody */
        BulkImportBody: {
            /** Rows */
            rows: components["schemas"]["BulkImportRow"][];
        };
        /**
         * BulkImportRow
         * @description One row in a founder bulk-import payload.
         *
         *     Constraints are intentionally minimal to ease CSV translation — the
         *     resolver handles missing OHLCV gracefully by leaving the capture as
         *     pending_outcome for the next tick.
         */
        BulkImportRow: {
            /** Symbol */
            symbol: string;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /**
             * Captured At Ms
             * @description Unix ms when the setup was observed
             */
            captured_at_ms: number;
            /**
             * Pattern Slug
             * @default
             */
            pattern_slug: string;
            /**
             * Phase
             * @default
             */
            phase: string;
            /** User Note */
            user_note?: string | null;
            research_context?: components["schemas"]["ResearchContextBody"] | null;
            /**
             * Entry Price
             * @description Optional hint. Resolver derives entry_price from OHLCV regardless.
             */
            entry_price?: number | null;
        };
        /** CaptionRequest */
        CaptionRequest: {
            /**
             * Symbol
             * @description 예: BTCUSDT
             */
            symbol: string;
            /**
             * Direction
             * @description long | short
             */
            direction: string;
            /** Entry Price */
            entry_price: number;
            /** Exit Price */
            exit_price: number;
            /**
             * Pnl Usdt
             * @description 손익 USDT (+수익 / -손실)
             */
            pnl_usdt: number;
            /**
             * Pnl Pct
             * @description 손익 %
             */
            pnl_pct: number;
            /**
             * Pattern Name
             * @description 발동 패턴 이름
             */
            pattern_name: string;
            /**
             * Hold Hours
             * @description 보유 시간 (h)
             */
            hold_hours: number;
        };
        /** CaptureBenchmarkSearchBody */
        CaptureBenchmarkSearchBody: {
            /** Candidate Timeframes */
            candidate_timeframes?: string[] | null;
            /**
             * Warmup Bars
             * @default 240
             */
            warmup_bars: number;
            /**
             * Min Reference Score
             * @default 0.55
             */
            min_reference_score: number;
            /**
             * Min Holdout Score
             * @default 0.35
             */
            min_holdout_score: number;
        };
        /** CaptureCreateBody */
        CaptureCreateBody: {
            /**
             * Capture Kind
             * @default pattern_candidate
             * @enum {string}
             */
            capture_kind: "pattern_candidate" | "manual_hypothesis" | "chart_bookmark" | "post_trade_review";
            /** Symbol */
            symbol: string;
            /**
             * Pattern Slug
             * @default
             */
            pattern_slug: string;
            /**
             * Pattern Version
             * @default 1
             */
            pattern_version: number;
            /**
             * Phase
             * @default
             */
            phase: string;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /** Candidate Transition Id */
            candidate_transition_id?: string | null;
            /** Candidate Id */
            candidate_id?: string | null;
            /** Scan Id */
            scan_id?: string | null;
            /** User Note */
            user_note?: string | null;
            /** Chart Context */
            chart_context?: {
                [key: string]: unknown;
            };
            research_context?: components["schemas"]["ResearchContextBody"] | null;
            /** Feature Snapshot */
            feature_snapshot?: {
                [key: string]: unknown;
            } | null;
            /** Block Scores */
            block_scores?: {
                [key: string]: unknown;
            };
        };
        /** ChallengeCreateRequest */
        ChallengeCreateRequest: {
            /** Snaps */
            snaps: components["schemas"]["SnapInput"][];
            /** User Id */
            user_id?: string | null;
        };
        /** ChallengeCreateResponse */
        ChallengeCreateResponse: {
            /** Slug */
            slug: string;
            /** Strategies */
            strategies: components["schemas"]["StrategyResult"][];
            /** Recommended */
            recommended: string;
            /** Feature Vector */
            feature_vector: number[];
        };
        /** ChallengeScanResponse */
        ChallengeScanResponse: {
            /** Slug */
            slug: string;
            /**
             * Scanned At
             * Format: date-time
             */
            scanned_at: string;
            /** Matches */
            matches: components["schemas"]["ScanMatch"][];
        };
        /** ChatRequest */
        ChatRequest: {
            /** Message */
            message: string;
            /**
             * Symbol
             * @default BTCUSDT
             */
            symbol: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /** Model */
            model?: string | null;
            /** History */
            history?: {
                [key: string]: string;
            }[] | null;
        };
        /** CommitRequest */
        CommitRequest: {
            /** Draft Id */
            draft_id: string;
            /**
             * Selected Strictness
             * @default base
             */
            selected_strictness: string;
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /** Direction */
            direction?: string | null;
        };
        /** ConfirmPaymentRequest */
        ConfirmPaymentRequest: {
            /** Evaluation Id */
            evaluation_id: string;
            /** Stripe Payment Intent */
            stripe_payment_intent: string;
            /** User Id */
            user_id: string;
        };
        /** CounterfactualReviewResponse */
        CounterfactualReviewResponse: {
            /** Ok */
            ok: boolean;
            /** Data */
            data?: {
                [key: string]: unknown;
            } | null;
            /** Error */
            error?: string | null;
        };
        /** CreateAccountBody */
        CreateAccountBody: {
            /** User Id */
            user_id: string;
            /** Action */
            action: string;
            /** Exit Policy */
            exit_policy?: {
                [key: string]: unknown;
            } | null;
            /** Strategy Id */
            strategy_id?: string | null;
            /** Symbols */
            symbols?: string[] | null;
        };
        /** CreateRuleRequest */
        CreateRuleRequest: {
            /** Trigger */
            trigger: {
                [key: string]: unknown;
            };
            /** User Id */
            user_id?: string | null;
        };
        /** DebugHypothesis */
        DebugHypothesis: {
            /** Id */
            id: string;
            /** Text */
            text: string;
            /**
             * Status
             * @enum {string}
             */
            status: "open" | "confirmed" | "rejected";
            /** Evidence */
            evidence?: string[];
            /** Rejection Reason */
            rejection_reason?: string | null;
        };
        /** DedupKeyOut */
        DedupKeyOut: {
            /** Pattern Slug */
            pattern_slug: string;
            /** Symbol */
            symbol: string;
            /** Neighbor Pattern Id */
            neighbor_pattern_id: string;
            /** Anchor Window Hash */
            anchor_window_hash: string;
        };
        /** DeepPerpData */
        DeepPerpData: {
            /** Fr */
            fr?: number | null;
            /** Oi Pct */
            oi_pct?: number | null;
            /** Ls Ratio */
            ls_ratio?: number | null;
            /** Taker Ratio */
            taker_ratio?: number | null;
            /** Price Pct */
            price_pct?: number | null;
            /** Oi Notional */
            oi_notional?: number | null;
            /** Vol 24H */
            vol_24h?: number | null;
            /** Mark Price */
            mark_price?: number | null;
            /** Index Price */
            index_price?: number | null;
            /**
             * Short Liq Usd
             * @default 0
             */
            short_liq_usd: number;
            /**
             * Long Liq Usd
             * @default 0
             */
            long_liq_usd: number;
            /** Spot Price */
            spot_price?: number | null;
        };
        /** DeepRequest */
        DeepRequest: {
            /** Symbol */
            symbol: string;
            /** Klines */
            klines: components["schemas"]["KlineBar"][];
            perp?: components["schemas"]["DeepPerpData"];
        };
        /** DeepResponse */
        DeepResponse: {
            /** Symbol */
            symbol: string;
            /** Total Score */
            total_score: number;
            /** Verdict */
            verdict: string;
            /** Layers */
            layers: {
                [key: string]: components["schemas"]["LayerOut"];
            };
            /** Atr Levels */
            atr_levels: {
                [key: string]: unknown;
            };
            /** Alpha */
            alpha?: {
                [key: string]: unknown;
            } | null;
            /** Hunt Score */
            hunt_score?: number | null;
        };
        /** DiscoverResponse */
        DiscoverResponse: {
            /** Cycle Id */
            cycle_id: string;
            /** Proposals */
            proposals: number;
            /** Turns Used */
            turns_used: number;
            /** Stop Reason */
            stop_reason: string | null;
            /** Error */
            error: string | null;
            /** Proposal Paths */
            proposal_paths: string[];
        };
        /** EnqueueRowOut */
        EnqueueRowOut: {
            /** Neighbor Pattern Id */
            neighbor_pattern_id: string;
            /** Similarity Score */
            similarity_score: number;
            /** K Rank */
            k_rank: number;
            /** Size Usd */
            size_usd: number;
            /** Size Capped */
            size_capped: boolean;
            /** Exit Source */
            exit_source: string;
        };
        /** EnsembleSignal */
        EnsembleSignal: {
            /** Direction */
            direction: string;
            /** Ensemble Score */
            ensemble_score: number;
            /** Ml Contribution */
            ml_contribution: number;
            /** Block Contribution */
            block_contribution: number;
            /** Regime Contribution */
            regime_contribution: number;
            /** Confidence */
            confidence: string;
            /** Reason */
            reason: string;
            /** Block Analysis */
            block_analysis: {
                [key: string]: unknown;
            };
        };
        /** EstimateRequest */
        EstimateRequest: {
            /** Draft Id */
            draft_id: string;
            /**
             * Strictness
             * @default base
             */
            strictness: string;
        };
        /** ExplainRequest */
        ExplainRequest: {
            /** Symbol */
            symbol: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /** Indicator Snapshot */
            indicator_snapshot?: {
                [key: string]: number;
            };
            /** Anomaly Flags */
            anomaly_flags?: components["schemas"]["AnomalyFlag"][];
            /** Alpha Score */
            alpha_score?: {
                [key: string]: unknown;
            } | null;
            /** User Id */
            user_id?: string | null;
        };
        /** ExtremeEventOut */
        ExtremeEventOut: {
            /** Symbol */
            symbol: string;
            /** Kind */
            kind: string;
            /** Magnitude */
            magnitude: number;
            /**
             * Detected At
             * Format: date-time
             */
            detected_at: string;
            /** Outcome 24H */
            outcome_24h?: number | null;
            /** Outcome 48H */
            outcome_48h?: number | null;
            /** Outcome 72H */
            outcome_72h?: number | null;
            /** Is Predictive */
            is_predictive?: boolean | null;
        };
        /** ExtremeEventsResponse */
        ExtremeEventsResponse: {
            /** Items */
            items: components["schemas"]["ExtremeEventOut"][];
            /** Generated At */
            generated_at: number;
        };
        /** FilterDragResponse */
        FilterDragResponse: {
            /** Ok */
            ok: boolean;
            /** Data */
            data?: {
                [key: string]: unknown;
            } | null;
            /** Error */
            error?: string | null;
        };
        /** FindingsResponse */
        FindingsResponse: {
            /** Date */
            date: string;
            /** Findings */
            findings: string[];
            /** Count */
            count: number;
        };
        /** FormulaEvidenceItem */
        FormulaEvidenceItem: {
            /** Scope Kind */
            scope_kind: string;
            /** Scope Value */
            scope_value: string;
            /** Sample N */
            sample_n?: number | null;
            /** Blocked Winner Rate */
            blocked_winner_rate?: number | null;
            /** Good Block Rate */
            good_block_rate?: number | null;
            /** Drag Score */
            drag_score?: number | null;
            /** Avg Missed Pnl */
            avg_missed_pnl?: number | null;
            /** Computed At */
            computed_at?: string | null;
        };
        /** FormulaResponse */
        FormulaResponse: {
            /** Ok */
            ok: boolean;
            /** Data */
            data?: {
                [key: string]: unknown;
            } | null;
            /** Error */
            error?: string | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** JudgeRequest */
        JudgeRequest: {
            /** Symbol */
            symbol: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /** Indicator Snapshot */
            indicator_snapshot?: {
                [key: string]: number;
            };
            /** Alpha Score */
            alpha_score?: {
                [key: string]: unknown;
            } | null;
            /** Last Price */
            last_price?: number | null;
            /** User Id */
            user_id?: string | null;
        };
        /** JudgeResponse */
        JudgeResponse: {
            /** Verdict */
            verdict: string;
            /** Entry */
            entry: number | null;
            /** Stop */
            stop: number | null;
            /** Target */
            target: number | null;
            /** P Win */
            p_win: number | null;
            /** Rr */
            rr: number | null;
            /** Rationale */
            rationale: string;
            /** Text */
            text: string;
            /** Cmd */
            cmd: string;
            /** Latency Ms */
            latency_ms: number;
            /** Provider */
            provider: string;
        };
        /** KillSwitchStateOut */
        KillSwitchStateOut: {
            /** Armed */
            armed: boolean;
            /** Reason */
            reason: string;
            /** Actor */
            actor: string;
        };
        /** KimpBatch */
        KimpBatch: {
            /** Ticks */
            ticks: components["schemas"]["KimpTickPayload"][];
        };
        /** KimpTickPayload */
        KimpTickPayload: {
            /** Symbol */
            symbol: string;
            /** Kimp Pct */
            kimp_pct: number;
            /**
             * Krw Exchange
             * @default upbit
             */
            krw_exchange: string;
            /** Usd Price */
            usd_price: number;
            /** Ts */
            ts?: string | null;
            /** Fear Greed */
            fear_greed?: number | null;
        };
        /**
         * KlineBar
         * @description One normalized OHLCV bar from exchange data.
         */
        KlineBar: {
            /** T */
            t: number;
            /** O */
            o: number;
            /** H */
            h: number;
            /** L */
            l: number;
            /** C */
            c: number;
            /** V */
            v: number;
            /**
             * Tbv
             * @default 0
             */
            tbv: number;
        };
        /** LayerOut */
        LayerOut: {
            /** Score */
            score: number;
            /** Sigs */
            sigs: {
                [key: string]: string;
            }[];
            /** Meta */
            meta: {
                [key: string]: unknown;
            };
        };
        /** LiqBatch */
        LiqBatch: {
            /** Events */
            events: components["schemas"]["LiqCascadePayload"][];
        };
        /** LiqCascadePayload */
        LiqCascadePayload: {
            /** Symbol */
            symbol: string;
            /** Direction */
            direction: string;
            /** Zscore */
            zscore: number;
            /** Total Size Usd */
            total_size_usd: number;
            /** Peak Velocity */
            peak_velocity: number;
            /** Started At */
            started_at: string;
            /** Usd Price */
            usd_price?: number | null;
            /** Cascade Id */
            cascade_id?: string | null;
        };
        /** LogoutResponse */
        LogoutResponse: {
            /** Ok */
            ok: boolean;
            /** Message */
            message: string;
        };
        /** MarketSearchRequest */
        MarketSearchRequest: {
            /** Pattern Slug */
            pattern_slug: string;
            /** Variant Slug */
            variant_slug?: string | null;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /** Universe */
            universe?: string[] | null;
            /**
             * Top K
             * @default 20
             */
            top_k: number;
            /**
             * Run Type
             * @default user
             */
            run_type: string;
            /** Indicator Filters */
            indicator_filters?: {
                [key: string]: unknown;
            }[] | null;
        };
        /** MarketSearchResponse */
        MarketSearchResponse: {
            /** Run Id */
            run_id: string;
            /** Pattern Slug */
            pattern_slug: string;
            /** Candidates */
            candidates: {
                [key: string]: unknown;
            }[];
            /** Total Candidates */
            total_candidates: number;
            /** Retrieval Source */
            retrieval_source: string;
            /** Run Type */
            run_type: string;
            /** Elapsed Ms */
            elapsed_ms: number;
            /** No Candidates Reason */
            no_candidates_reason?: string | null;
        };
        /** MemoryCandidate */
        MemoryCandidate: {
            /** Id */
            id: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "identity" | "belief" | "experience" | "preference" | "fact" | "procedure" | "debug_hypothesis" | "debug_rejected";
            /** Text */
            text: string;
            /**
             * Base Score
             * @default 0
             */
            base_score: number;
            /**
             * Confidence
             * @default observed
             * @enum {string}
             */
            confidence: "verified" | "observed" | "hypothesis";
            /**
             * Access Count
             * @default 0
             */
            access_count: number;
            /** Tags */
            tags?: string[];
            /** Conditions */
            conditions?: {
                [key: string]: unknown;
            };
        };
        /** MemoryContext */
        MemoryContext: {
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /** Mode */
            mode?: string | null;
            /** Intent */
            intent?: string | null;
            /** Challenge Slug */
            challenge_slug?: string | null;
            /** Challenge Instance */
            challenge_instance?: string | null;
            /** As Of */
            as_of?: string | null;
        };
        /** MemoryCreate */
        MemoryCreate: {
            /** User Id */
            user_id: string;
            /** Text */
            text: string;
            /**
             * Kind
             * @default note
             */
            kind: string;
            /** Tags */
            tags?: string[];
            /**
             * Confidence
             * @default 0.7
             */
            confidence: number;
        };
        /** MemoryDebugSessionRequest */
        MemoryDebugSessionRequest: {
            /** Session Id */
            session_id: string;
            context?: components["schemas"]["MemoryContext"];
            /** Hypotheses */
            hypotheses: components["schemas"]["DebugHypothesis"][];
            /** Started At */
            started_at: string;
            /** Ended At */
            ended_at?: string | null;
        };
        /** MemoryDebugSessionResponse */
        MemoryDebugSessionResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Schema Version
             * @default 1
             */
            schema_version: number;
            /** Session Id */
            session_id: string;
            /** Rejected Indexed */
            rejected_indexed: number;
            /** Updated At */
            updated_at: string;
        };
        /** MemoryFeedbackBatchItem */
        MemoryFeedbackBatchItem: {
            /** Memory Id */
            memory_id: string;
            /**
             * Access Count
             * @default 0
             */
            access_count: number;
            /** Updated At */
            updated_at: string;
        };
        /** MemoryFeedbackBatchRequest */
        MemoryFeedbackBatchRequest: {
            /** Items */
            items: components["schemas"]["MemoryFeedbackRequest"][];
        };
        /** MemoryFeedbackBatchResponse */
        MemoryFeedbackBatchResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Schema Version
             * @default 1
             */
            schema_version: number;
            /** Processed */
            processed: number;
            /** Items */
            items: components["schemas"]["MemoryFeedbackBatchItem"][];
        };
        /** MemoryFeedbackRequest */
        MemoryFeedbackRequest: {
            /** Query Id */
            query_id: string;
            /** Memory Id */
            memory_id: string;
            /**
             * Event
             * @enum {string}
             */
            event: "retrieved" | "used" | "dismissed" | "contradicted" | "confirmed";
            context?: components["schemas"]["MemoryContext"];
            /** Occurred At */
            occurred_at?: string | null;
            /** Note */
            note?: string | null;
        };
        /** MemoryFeedbackResponse */
        MemoryFeedbackResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Schema Version
             * @default 1
             */
            schema_version: number;
            /** Memory Id */
            memory_id: string;
            /**
             * Access Count
             * @default 0
             */
            access_count: number;
            /** Updated At */
            updated_at: string;
        };
        /** MemoryQueryDebug */
        MemoryQueryDebug: {
            /** Rerank Applied */
            rerank_applied: boolean;
            /** Base Result Count */
            base_result_count: number;
            /** Elapsed Ms */
            elapsed_ms: number;
        };
        /** MemoryQueryRequest */
        MemoryQueryRequest: {
            /** Query */
            query: string;
            context?: components["schemas"]["MemoryContext"];
            /** Candidates */
            candidates?: components["schemas"]["MemoryCandidate"][];
            /**
             * Top K
             * @default 8
             */
            top_k: number;
        };
        /** MemoryQueryResponse */
        MemoryQueryResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Schema Version
             * @default 1
             */
            schema_version: number;
            /** Query Id */
            query_id: string;
            /** Records */
            records: components["schemas"]["MemoryRankedRecord"][];
            debug: components["schemas"]["MemoryQueryDebug"];
        };
        /** MemoryRankedRecord */
        MemoryRankedRecord: {
            /** Id */
            id: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "identity" | "belief" | "experience" | "preference" | "fact" | "procedure" | "debug_hypothesis" | "debug_rejected";
            /** Text */
            text: string;
            /** Score */
            score: number;
            /** Base Score */
            base_score: number;
            /**
             * Confidence
             * @enum {string}
             */
            confidence: "verified" | "observed" | "hypothesis";
            /** Access Count */
            access_count: number;
            /** Tags */
            tags: string[];
            /** Reasons */
            reasons?: string[];
        };
        /** MemoryRejectedLookupRequest */
        MemoryRejectedLookupRequest: {
            /** Symbol */
            symbol?: string | null;
            /** Intent */
            intent?: string | null;
            /** Query */
            query?: string | null;
            /**
             * Limit
             * @default 10
             */
            limit: number;
        };
        /** MemoryRejectedLookupResponse */
        MemoryRejectedLookupResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Schema Version
             * @default 1
             */
            schema_version: number;
            /** Records */
            records: components["schemas"]["MemoryRejectedRecord"][];
        };
        /** MemoryRejectedRecord */
        MemoryRejectedRecord: {
            /** Id */
            id: string;
            /** Session Id */
            session_id: string;
            /** Text */
            text: string;
            /** Rejection Reason */
            rejection_reason?: string | null;
            /** Symbol */
            symbol?: string | null;
            /** Intent */
            intent?: string | null;
            /** Updated At */
            updated_at: string;
        };
        /** ModeStatusOut */
        ModeStatusOut: {
            /** Status */
            status: string;
            /** Reasoning */
            reasoning: string;
        };
        /** NahonjaBatch */
        NahonjaBatch: {
            /** Payloads */
            payloads: {
                [key: string]: unknown;
            }[];
        };
        /** OpenPositionRequest */
        OpenPositionRequest: {
            /**
             * Symbol
             * @description 예: BTCUSDT
             */
            symbol: string;
            /**
             * Direction
             * @description long | short
             */
            direction: string;
            /**
             * Entry Price
             * @description 진입가 USDT
             */
            entry_price: number;
            /**
             * Size Coin
             * @description 포지션 크기 (코인 수)
             */
            size_coin: number;
            /**
             * Stop Price
             * @description 손절가 USDT
             */
            stop_price: number;
            /**
             * Target Price
             * @description 목표가 USDT
             */
            target_price: number;
        };
        /** OpportunityMacroBackdrop */
        OpportunityMacroBackdrop: {
            /** Fedfundsrate */
            fedFundsRate?: number | null;
            /** Yieldcurvespread */
            yieldCurveSpread?: number | null;
            /** M2Changepct */
            m2ChangePct?: number | null;
            /** Overallmacroscore */
            overallMacroScore: number;
            /** Regime */
            regime: string;
        };
        /** OpportunityRunRequest */
        OpportunityRunRequest: {
            /**
             * Limit
             * @default 15
             */
            limit: number;
            /** User Id */
            user_id?: string | null;
        };
        /** OpportunityRunResponse */
        OpportunityRunResponse: {
            /** Coins */
            coins: components["schemas"]["OpportunityScore"][];
            macroBackdrop: components["schemas"]["OpportunityMacroBackdrop"];
            /** Scannedat */
            scannedAt: number;
            /** Scandurationms */
            scanDurationMs: number;
        };
        /** OpportunityScore */
        OpportunityScore: {
            /** Symbol */
            symbol: string;
            /** Name */
            name: string;
            /** Slug */
            slug: string;
            /** Price */
            price: number;
            /** Change1H */
            change1h: number;
            /** Change24H */
            change24h: number;
            /** Change7D */
            change7d: number;
            /** Volume24H */
            volume24h: number;
            /** Marketcap */
            marketCap: number;
            /** Momentumscore */
            momentumScore: number;
            /** Volumescore */
            volumeScore: number;
            /** Socialscore */
            socialScore: number;
            /** Macroscore */
            macroScore: number;
            /** Onchainscore */
            onchainScore: number;
            /** Totalscore */
            totalScore: number;
            /** Direction */
            direction: string;
            /** Confidence */
            confidence: number;
            /** Reasons */
            reasons: string[];
            /** Sentiment */
            sentiment?: number | null;
            /** Socialvolume */
            socialVolume?: number | null;
            /** Galaxyscore */
            galaxyScore?: number | null;
            /** Alerts */
            alerts: string[];
            /** Compositescore */
            compositeScore?: number | null;
        };
        /** ParserMetaBody */
        ParserMetaBody: {
            /** Parser Role */
            parser_role: string;
            /** Parser Model */
            parser_model: string;
            /** Parser Prompt Version */
            parser_prompt_version: string;
            /**
             * Pattern Draft Schema Version
             * @default 1
             */
            pattern_draft_schema_version: number;
            /** Signal Vocab Version */
            signal_vocab_version: string;
            /** Confidence */
            confidence?: number | null;
            /**
             * Ambiguity Count
             * @default 0
             */
            ambiguity_count: number;
        };
        /** PatternDraftBody */
        PatternDraftBody: {
            /**
             * Schema Version
             * @default 1
             */
            schema_version: number;
            /** Pattern Family */
            pattern_family: string;
            /** Pattern Label */
            pattern_label?: string | null;
            /** Source Type */
            source_type: string;
            /** Source Text */
            source_text: string;
            /** Symbol Candidates */
            symbol_candidates?: string[];
            /** Timeframe */
            timeframe?: string | null;
            /** Thesis */
            thesis?: string[];
            /** Phases */
            phases?: components["schemas"]["PatternDraftPhaseBody"][];
            /** Trade Plan */
            trade_plan?: {
                [key: string]: unknown;
            };
            search_hints?: components["schemas"]["PatternDraftSearchHintsBody"];
            /** Confidence */
            confidence?: number | null;
            /** Ambiguities */
            ambiguities?: string[];
        };
        /** PatternDraftPhaseBody */
        PatternDraftPhaseBody: {
            /** Phase Id */
            phase_id: string;
            /** Label */
            label: string;
            /**
             * Sequence Order
             * @default 0
             */
            sequence_order: number;
            /**
             * Description
             * @default
             */
            description: string;
            /** Timeframe */
            timeframe?: string | null;
            /** Signals Required */
            signals_required?: string[];
            /** Signals Preferred */
            signals_preferred?: string[];
            /** Signals Forbidden */
            signals_forbidden?: string[];
            /** Directional Belief */
            directional_belief?: string | null;
            /** Evidence Text */
            evidence_text?: string | null;
            /** Time Hint */
            time_hint?: string | null;
            /** Importance */
            importance?: number | null;
        };
        /** PatternDraftSearchHintsBody */
        PatternDraftSearchHintsBody: {
            /** Must Have Signals */
            must_have_signals?: string[];
            /** Preferred Timeframes */
            preferred_timeframes?: string[];
            /** Exclude Patterns */
            exclude_patterns?: string[];
            /** Similarity Focus */
            similarity_focus?: string[];
            /** Symbol Scope */
            symbol_scope?: string[];
        };
        /** PatternDraftTransformRequest */
        PatternDraftTransformRequest: {
            pattern_draft: components["schemas"]["PatternDraftBody"];
            parser_meta?: components["schemas"]["ParserMetaBody"] | null;
        };
        /** PatternDraftTransformResponse */
        PatternDraftTransformResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default search
             * @constant
             */
            plane: "search";
            /**
             * Status
             * @default transformed
             * @constant
             */
            status: "transformed";
            /** Generated At */
            generated_at: string;
            /** Search Query Spec */
            search_query_spec: {
                [key: string]: unknown;
            };
            /** Transformer Meta */
            transformer_meta?: {
                [key: string]: unknown;
            };
            /** Parser Meta */
            parser_meta?: {
                [key: string]: unknown;
            } | null;
        };
        /** PatternObjectResponse */
        PatternObjectResponse: {
            /** Slug */
            slug: string;
            /** Name */
            name: string;
            /** Description */
            description: string;
            /** Direction */
            direction: string;
            /** Timeframe */
            timeframe: string;
            /** Version */
            version: number;
            /** Entry Phase */
            entry_phase: string;
            /** Target Phase */
            target_phase: string;
            /** Phase Ids */
            phase_ids: string[];
            /** Tags */
            tags: string[];
            /** Universe Scope */
            universe_scope: string;
        };
        /** PatternPaperSpawnBody */
        PatternPaperSpawnBody: {
            /** Symbol */
            symbol: string;
            /** Anchor Ts Ms */
            anchor_ts_ms: number;
            /** Query Features */
            query_features: {
                [key: string]: number;
            };
            /** Historical Features */
            historical_features: {
                [key: string]: unknown;
            }[];
            /**
             * K
             * @default 5
             */
            k: number;
            /** Max Distance */
            max_distance?: number | null;
            /**
             * Equity Usd
             * @default 10000
             */
            equity_usd: number;
            /**
             * Max Size Pct
             * @default 0.02
             */
            max_size_pct: number;
            /** Kelly Hint */
            kelly_hint?: number | null;
            /**
             * Exit Source
             * @default regime_exit
             */
            exit_source: string;
        };
        /** PatternPaperSpawnResponse */
        PatternPaperSpawnResponse: {
            /** Enqueued */
            enqueued: components["schemas"]["EnqueueRowOut"][];
            /** Skipped Dedup */
            skipped_dedup: components["schemas"]["DedupKeyOut"][];
            /** Skipped Kill Switch */
            skipped_kill_switch: boolean;
            /** Skipped Empty Similarity */
            skipped_empty_similarity: boolean;
        };
        /**
         * PerpSnapshot
         * @description Current-bar derivatives data with neutral-safe defaults.
         */
        PerpSnapshot: {
            /**
             * Funding Rate
             * @default 0
             */
            funding_rate: number;
            /**
             * Oi Change 1H
             * @default 0
             */
            oi_change_1h: number;
            /**
             * Oi Change 24H
             * @default 0
             */
            oi_change_24h: number;
            /**
             * Long Short Ratio
             * @default 1
             */
            long_short_ratio: number;
            /** Taker Buy Ratio */
            taker_buy_ratio?: number | null;
        };
        /** PnLStatsPoint */
        PnLStatsPoint: {
            /** Ts */
            ts: string;
            /** Cumulative Pnl Bps */
            cumulative_pnl_bps: number;
        };
        /** PnLStatsResponse */
        PnLStatsResponse: {
            /** Pattern Slug */
            pattern_slug: string;
            /** N */
            n: number;
            /** Mean Pnl Bps */
            mean_pnl_bps: number | null;
            /** Std Pnl Bps */
            std_pnl_bps: number | null;
            /** Sharpe Like */
            sharpe_like: number | null;
            /** Win Rate */
            win_rate: number | null;
            /** Loss Rate */
            loss_rate: number | null;
            /** Indeterminate Rate */
            indeterminate_rate: number | null;
            /** Ci Low */
            ci_low: number | null;
            /** Ci High */
            ci_high: number | null;
            /** Preliminary */
            preliminary: boolean;
            /** Btc Hold Return Pct */
            btc_hold_return_pct: number | null;
            /** Equity Curve */
            equity_curve: components["schemas"]["PnLStatsPoint"][];
        };
        /** PoolingChainOut */
        PoolingChainOut: {
            cell: components["schemas"]["PoolingNodeOut"];
            parent: components["schemas"]["PoolingNodeOut"] | null;
            grandparent: components["schemas"]["PoolingNodeOut"] | null;
        };
        /** PoolingNodeOut */
        PoolingNodeOut: {
            /** Key */
            key: string;
            /** N */
            n: number;
            /** Weight */
            weight: number;
        };
        /** PositionVerdictRequest */
        PositionVerdictRequest: {
            /** Symbol */
            symbol: string;
            /** Direction */
            direction: string;
            /** Entry Price */
            entry_price: number;
            /** Current Price */
            current_price: number;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
        };
        /** PreviewRequest */
        PreviewRequest: {
            /** Url */
            url: string;
        };
        /** QualityJudgementRequest */
        QualityJudgementRequest: {
            /** Run Id */
            run_id: string;
            /** Candidate Id */
            candidate_id: string;
            /**
             * Verdict
             * @description 'good' | 'bad' | 'neutral'
             */
            verdict: string;
            /** Symbol */
            symbol?: string | null;
            /** Layer A Score */
            layer_a_score?: number | null;
            /** Layer B Score */
            layer_b_score?: number | null;
            /** Layer C Score */
            layer_c_score?: number | null;
            /** Final Score */
            final_score?: number | null;
            /** User Id */
            user_id?: string | null;
        };
        /** QualityJudgementResponse */
        QualityJudgementResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /** Judgement Id */
            judgement_id: string;
        };
        /** QualityStatsResponse */
        QualityStatsResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default search
             * @constant
             */
            plane: "search";
            /** Total Judgements */
            total_judgements: number;
            /** Layers */
            layers?: {
                [key: string]: unknown;
            };
            /** Active Weights */
            active_weights?: {
                [key: string]: number;
            };
            /** Generated At */
            generated_at: string;
        };
        /** RagDedupeHashRequest */
        RagDedupeHashRequest: {
            /** Pair */
            pair: string;
            /** Timeframe */
            timeframe: string;
            /** Direction */
            direction: string;
            /** Regime */
            regime: string;
            /** Source */
            source: string;
            /**
             * Windowminutes
             * @default 60
             */
            windowMinutes: number;
        };
        /** RagDedupeHashResponse */
        RagDedupeHashResponse: {
            /** Dedupehash */
            dedupeHash: string;
        };
        /** RagQuickTradeEmbeddingRequest */
        RagQuickTradeEmbeddingRequest: {
            /** Pair */
            pair: string;
            /** Direction */
            direction: string;
            /** Entryprice */
            entryPrice: number;
            /** Currentprice */
            currentPrice: number;
            /** Tp */
            tp?: number | null;
            /** Sl */
            sl?: number | null;
            /** Source */
            source: string;
            /**
             * Confidence
             * @default 50
             */
            confidence: number;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
        };
        /** RagScanSignal */
        RagScanSignal: {
            /** Agentid */
            agentId: string;
            /** Vote */
            vote: string;
            /** Confidence */
            confidence: number;
        };
        /** RagSignalActionEmbeddingRequest */
        RagSignalActionEmbeddingRequest: {
            /** Pair */
            pair: string;
            /** Direction */
            direction: string;
            /** Actiontype */
            actionType: string;
            /** Confidence */
            confidence?: number | null;
            /** Source */
            source: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
        };
        /** RagTerminalScanEmbeddingRequest */
        RagTerminalScanEmbeddingRequest: {
            /** Signals */
            signals: components["schemas"]["RagScanSignal"][];
            /** Timeframe */
            timeframe: string;
            /**
             * Datacompleteness
             * @default 0.7
             */
            dataCompleteness: number;
        };
        /** RagVectorResponse */
        RagVectorResponse: {
            /** Embedding */
            embedding: number[];
        };
        /** RangeRequest */
        RangeRequest: {
            /** Symbol */
            symbol: string;
            /** Start Ts */
            start_ts: number;
            /** End Ts */
            end_ts: number;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
        };
        /** RecentTradeOut */
        RecentTradeOut: {
            /** Trade Id */
            trade_id: string;
            /** Exit Reason */
            exit_reason: string;
            /** Pnl Pct */
            pnl_pct: number;
            /** Closed At */
            closed_at: string;
        };
        /** ReplayRequest */
        ReplayRequest: {
            /**
             * Model
             * @default sonnet
             */
            model: string;
            /**
             * Max Tokens
             * @default 1024
             */
            max_tokens: number;
        };
        /** RescueResponse */
        RescueResponse: {
            /** Rescued */
            rescued: boolean;
            /** New Score */
            new_score: number;
        };
        /** ResearchContextBody */
        ResearchContextBody: {
            source?: components["schemas"]["ResearchSourceBody"] | null;
            /** Pattern Family */
            pattern_family?: string | null;
            /** Thesis */
            thesis?: string[];
            /** Phase Annotations */
            phase_annotations?: components["schemas"]["ResearchPhaseAnnotationBody"][];
            entry_spec?: components["schemas"]["ResearchEntrySpecBody"] | null;
            outcome_spec?: components["schemas"]["ResearchOutcomeSpecBody"] | null;
            /** Research Tags */
            research_tags?: string[];
            pattern_draft?: components["schemas"]["PatternDraftBody"] | null;
            parser_meta?: components["schemas"]["ParserMetaBody"] | null;
        };
        /** ResearchEntrySpecBody */
        ResearchEntrySpecBody: {
            /** Entry Phase Id */
            entry_phase_id: string;
            /** Entry Trigger */
            entry_trigger?: string | null;
            /** Stop Rule */
            stop_rule?: string | null;
            /** Target Rule */
            target_rule?: string | null;
        };
        /** ResearchOutcomeSpecBody */
        ResearchOutcomeSpecBody: {
            /** Confirm Breakout Within Bars */
            confirm_breakout_within_bars?: number | null;
            /** Min Forward Return Pct */
            min_forward_return_pct?: number | null;
            /** Stretch Return Pct */
            stretch_return_pct?: number | null;
        };
        /** ResearchPhaseAnnotationBody */
        ResearchPhaseAnnotationBody: {
            /** Phase Id */
            phase_id: string;
            /** Label */
            label: string;
            /** Timeframe */
            timeframe: string;
            /** Start Ts */
            start_ts?: number | null;
            /** End Ts */
            end_ts?: number | null;
            /** Signals Required */
            signals_required?: string[];
            /** Signals Preferred */
            signals_preferred?: string[];
            /** Signals Forbidden */
            signals_forbidden?: string[];
            /** Note */
            note?: string | null;
        };
        /** ResearchSourceBody */
        ResearchSourceBody: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "telegram_post" | "chart_image" | "manual_note" | "terminal_capture";
            /** Author */
            author?: string | null;
            /** Title */
            title?: string | null;
            /** Text */
            text?: string | null;
            /** Image Refs */
            image_refs?: string[];
        };
        /** RuleOut */
        RuleOut: {
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** State */
            state: string;
            /** Direction */
            direction: string;
            /** Timeframe */
            timeframe: string;
            /** Methodology Tags */
            methodology_tags: string[];
            /** G1 Passed */
            g1_passed: boolean | null;
            /** G1 Detail */
            g1_detail: string | null;
            /** Created At */
            created_at: string;
        };
        /** RunOut */
        RunOut: {
            /** Run Id */
            run_id: string;
            /** Started At */
            started_at: string;
            /** Finished At */
            finished_at: string | null;
            /** Status */
            status: string;
            /** N Symbols */
            n_symbols: number;
            /** N Patterns */
            n_patterns: number;
            /** N Promoted */
            n_promoted: number;
            /** Elapsed S */
            elapsed_s: number | null;
            /** Error Msg */
            error_msg: string | null;
        };
        /** RuntimeCaptureListResponse */
        RuntimeCaptureListResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Captures */
            captures: {
                [key: string]: unknown;
            }[];
            /** Count */
            count: number;
        };
        /** RuntimeCaptureResponse */
        RuntimeCaptureResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Capture */
            capture: {
                [key: string]: unknown;
            };
        };
        /** RuntimeLedgerListResponse */
        RuntimeLedgerListResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Ledgers */
            ledgers: {
                [key: string]: unknown;
            }[];
            /** Count */
            count: number;
        };
        /** RuntimeLedgerResponse */
        RuntimeLedgerResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Ledger */
            ledger: {
                [key: string]: unknown;
            };
        };
        /** RuntimePatternDefinitionListResponse */
        RuntimePatternDefinitionListResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Definitions */
            definitions: {
                [key: string]: unknown;
            }[];
            /** Count */
            count: number;
        };
        /** RuntimePatternDefinitionResponse */
        RuntimePatternDefinitionResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Definition */
            definition: {
                [key: string]: unknown;
            };
        };
        /** RuntimeResearchContextCreate */
        RuntimeResearchContextCreate: {
            /** Symbol */
            symbol?: string | null;
            /** Pattern Slug */
            pattern_slug?: string | null;
            /** User Id */
            user_id?: string | null;
            /** Title */
            title?: string | null;
            /** Summary */
            summary?: string | null;
            /** Fact Refs */
            fact_refs?: string[];
            /** Search Refs */
            search_refs?: string[];
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
        };
        /** RuntimeResearchContextResponse */
        RuntimeResearchContextResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Research Context */
            research_context: {
                [key: string]: unknown;
            };
        };
        /** RuntimeSetupCreate */
        RuntimeSetupCreate: {
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /** User Id */
            user_id?: string | null;
            /** Title */
            title?: string | null;
            /** Summary */
            summary?: string | null;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
        };
        /** RuntimeSetupResponse */
        RuntimeSetupResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Setup */
            setup: {
                [key: string]: unknown;
            };
        };
        /** RuntimeWorkspacePinCreate */
        RuntimeWorkspacePinCreate: {
            /** Symbol */
            symbol: string;
            /** Timeframe */
            timeframe?: string | null;
            /** User Id */
            user_id?: string | null;
            /**
             * Kind
             * @default pin
             */
            kind: string;
            /** Summary */
            summary?: string | null;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
            /** Pin Id */
            pin_id?: string | null;
        };
        /** RuntimeWorkspaceResponse */
        RuntimeWorkspaceResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default runtime
             * @constant
             */
            plane: "runtime";
            /**
             * Status
             * @default fallback_local
             * @enum {string}
             */
            status: "durable" | "fallback_local" | "read_only";
            /** Generated At */
            generated_at: string;
            /** Workspace */
            workspace: {
                [key: string]: unknown;
            };
        };
        /** SaveRequest */
        SaveRequest: {
            /** Symbol */
            symbol: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /** Snapshot */
            snapshot?: {
                [key: string]: number;
            };
            /** Decision */
            decision?: {
                [key: string]: unknown;
            };
            /**
             * Trigger Origin
             * @default agent_judge
             */
            trigger_origin: string;
            /** User Id */
            user_id?: string | null;
        };
        /** SaveResponse */
        SaveResponse: {
            /** Capture Id */
            capture_id: string;
            /** Dup Of */
            dup_of: string | null;
            /** Reason Summary */
            reason_summary: string | null;
            /** Cmd */
            cmd: string;
            /** Latency Ms */
            latency_ms: number;
            /** Provider */
            provider: string;
        };
        /** ScanMatch */
        ScanMatch: {
            /** Symbol */
            symbol: string;
            /**
             * Timestamp
             * Format: date-time
             */
            timestamp: string;
            /** Similarity */
            similarity: number;
            /** P Win */
            p_win: number | null;
            /** Price */
            price: number;
        };
        /** ScoreRequest */
        ScoreRequest: {
            /** Symbol */
            symbol: string;
            /** Klines */
            klines: components["schemas"]["KlineBar"][];
            perp?: components["schemas"]["PerpSnapshot"];
        };
        /** ScoreResponse */
        ScoreResponse: {
            /** Snapshot */
            snapshot: {
                [key: string]: unknown;
            };
            /** P Win */
            p_win: number | null;
            /** Blocks Triggered */
            blocks_triggered: string[];
            ensemble?: components["schemas"]["EnsembleSignal"] | null;
            /**
             * Ensemble Triggered
             * @default false
             */
            ensemble_triggered: boolean;
        };
        /** SearchCandidate */
        SearchCandidate: {
            /** Candidate Id */
            candidate_id: string;
            /** Window Id */
            window_id?: string | null;
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /** Score */
            score: number;
            /** Definition Ref */
            definition_ref?: {
                [key: string]: unknown;
            } | null;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
        };
        /** SearchCatalogResponse */
        SearchCatalogResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default search
             * @constant
             */
            plane: "search";
            /** Status */
            status: string;
            /** Generated At */
            generated_at: string;
            /** Total Windows */
            total_windows: number;
            /** Windows */
            windows?: components["schemas"]["SearchCorpusWindowSummary"][];
        };
        /** SearchCorpusWindowSummary */
        SearchCorpusWindowSummary: {
            /** Window Id */
            window_id: string;
            /** Symbol */
            symbol: string;
            /** Timeframe */
            timeframe: string;
            /** Start Ts */
            start_ts: string;
            /** End Ts */
            end_ts: string;
            /** Bars */
            bars: number;
            /** Source */
            source: string;
            /** Signature */
            signature?: {
                [key: string]: unknown;
            };
        };
        /** SeedSearchRequest */
        SeedSearchRequest: {
            /** Definition Id */
            definition_id?: string | null;
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /** Signature */
            signature?: {
                [key: string]: unknown;
            };
            /**
             * Limit
             * @default 10
             */
            limit: number;
        };
        /** SeedSearchResponse */
        SeedSearchResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default search
             * @constant
             */
            plane: "search";
            /** Status */
            status: string;
            /** Generated At */
            generated_at: string;
            /** Run Id */
            run_id: string;
            /** Request */
            request?: {
                [key: string]: unknown;
            };
            /** Candidates */
            candidates?: components["schemas"]["SearchCandidate"][];
        };
        /**
         * SelectionGateRequest
         * @description Inputs for selection-gate evaluation.
         *
         *     Mirrors the canonical contract in W-0537 §5 / W-0538 §6 but slimmed to the
         *     fields the gate actually needs in v1. The frontend assembles this from the
         *     chart selection + active indicators + computed snapshot.
         */
        SelectionGateRequest: {
            /** Symbol */
            symbol: string;
            /** Timeframe */
            timeframe: string;
            /**
             * Bar Count
             * @description Number of bars inside selection
             */
            bar_count: number;
            /** Active Indicator Count */
            active_indicator_count: number;
            /**
             * Has Market Structure
             * @description OI / funding / liquidations available
             * @default false
             */
            has_market_structure: boolean;
            /**
             * Regime Confidence
             * @description Regime classifier confidence at selection anchor
             */
            regime_confidence?: number | null;
            /**
             * Independent Events Estimate
             * @description Pre-computed similar independent events (if any)
             */
            independent_events_estimate?: number | null;
        };
        /** SelectionGateResponse */
        SelectionGateResponse: {
            /**
             * Verdict
             * @enum {string}
             */
            verdict: "deployable" | "exploratory_only" | "insufficient_evidence";
            /**
             * Reason
             * @description Human-readable explanation of the verdict
             */
            reason: string;
            /**
             * Selection Quality Score
             * @description Composite quality score in [0, 1]; informational, not the gate primary
             */
            selection_quality_score: number;
            /**
             * Contributors
             * @description Per-criterion sub-scores in [0, 1] for explainability
             */
            contributors?: {
                [key: string]: number;
            };
        };
        /** SignalOut */
        SignalOut: {
            /** Symbol */
            symbol: string;
            /** Pattern */
            pattern: string;
            /** Timeframe */
            timeframe: string;
            /** Sharpe */
            sharpe: number | null;
            /** Hit Rate */
            hit_rate: number | null;
            /** N Trades */
            n_trades: number | null;
            /** Promoted At */
            promoted_at: string;
            /** Expires At */
            expires_at: string;
        };
        /** SignalsResponse */
        SignalsResponse: {
            /** Symbol */
            symbol: string;
            /** Signals */
            signals: components["schemas"]["SignalOut"][];
            /** Count */
            count: number;
        };
        /** SimilarCandidate */
        SimilarCandidate: {
            /** Candidate Id */
            candidate_id: string;
            /** Window Id */
            window_id: string;
            /** Symbol */
            symbol: string;
            /** Timeframe */
            timeframe: string;
            /** Start Ts */
            start_ts: string;
            /** End Ts */
            end_ts: string;
            /** Bars */
            bars: number;
            /**
             * Final Score
             * @description Blended 3-layer score ∈ [0, 1]
             */
            final_score: number;
            /**
             * Layer A Score
             * @description Feature signature similarity
             */
            layer_a_score: number;
            /**
             * Layer B Score
             * @description Phase path LCS similarity (None if no observed_phase_paths)
             */
            layer_b_score?: number | null;
            /**
             * Layer C Score
             * @description ML p_win from LightGBM (None if model not trained)
             */
            layer_c_score?: number | null;
            /**
             * Candidate Phase Path
             * @description Actual observed phase sequence for this candidate symbol.
             */
            candidate_phase_path?: string[];
            /** Signature */
            signature?: {
                [key: string]: unknown;
            };
            /**
             * Close Return Pct
             * @description Corpus window close-to-close return % (proxy outcome for display).
             */
            close_return_pct?: number | null;
        };
        /** SimilarRequest */
        SimilarRequest: {
            /** Symbol */
            symbol: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            similar: components["schemas"]["SimilarResult"];
            /** User Id */
            user_id?: string | null;
        };
        /** SimilarResult */
        SimilarResult: {
            /** Similar Segments */
            similar_segments: components["schemas"]["SimilarSegment"][];
            /** Win Rate */
            win_rate?: number | null;
            /** Avg Pnl */
            avg_pnl?: number | null;
            /**
             * Confidence
             * @default low
             */
            confidence: string;
        };
        /** SimilarSearchRequest */
        SimilarSearchRequest: {
            /**
             * Pattern Draft
             * @description PatternDraft with phases and search_hints. search_hints.target_return_pct / volatility_range / volume_breakout_threshold are used for Layer A scoring.
             */
            pattern_draft?: {
                [key: string]: unknown;
            };
            /**
             * Observed Phase Paths
             * @description Ordered phase IDs the user has already observed (e.g. ['DUMP','ACCUMULATION']). Activates Layer B scoring.
             */
            observed_phase_paths?: string[];
            /**
             * Symbol
             * @description Optional corpus filter — restrict candidates to one symbol.
             */
            symbol?: string | null;
            /**
             * Timeframe
             * @description Target timeframe for corpus candidates.
             * @default 4h
             */
            timeframe: string;
            /**
             * Top K
             * @description Maximum candidates returned.
             * @default 10
             */
            top_k: number;
        };
        /** SimilarSearchResponse */
        SimilarSearchResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default search
             * @constant
             */
            plane: "search";
            /** Status */
            status: string;
            /** Generated At */
            generated_at: string;
            /** Run Id */
            run_id: string;
            /** Request */
            request?: {
                [key: string]: unknown;
            };
            /** Candidates */
            candidates?: components["schemas"]["SimilarCandidate"][];
            /**
             * Scoring Layers
             * @description Which layers were active: {layer_a, layer_b, layer_c}
             */
            scoring_layers?: {
                [key: string]: boolean;
            };
            /**
             * Active Layers
             * @description Canonical layer visibility alias for scoring_layers.
             */
            active_layers?: {
                [key: string]: boolean;
            };
            /**
             * Stage Counts
             * @description Search pipeline visibility counts for corpus/ranking/return stages.
             */
            stage_counts?: {
                [key: string]: number;
            };
            /** Degraded Reason */
            degraded_reason?: string | null;
        };
        /** SimilarSegment */
        SimilarSegment: {
            /** Symbol */
            symbol: string;
            /** From Ts */
            from_ts: string;
            /** To Ts */
            to_ts: string;
            /** Similarity Score */
            similarity_score: number;
            /** Forward Pnl 4H */
            forward_pnl_4h?: number | null;
            /** Outcome */
            outcome?: string | null;
        };
        /** SlicerSpec */
        SlicerSpec: {
            /** Path */
            path: string;
            /** Module */
            module: string;
            /** Compute */
            compute: string;
            /** Has Min N */
            has_min_n: boolean;
            /** Summary */
            summary: string;
            /**
             * Min N Default
             * @default 2
             */
            min_n_default: number;
        };
        /** SnapInput */
        SnapInput: {
            /** Symbol */
            symbol: string;
            /**
             * Timestamp
             * Format: date-time
             */
            timestamp: string;
            /**
             * Label
             * @default
             */
            label: string;
        };
        /** StageTransitionPayload */
        StageTransitionPayload: {
            /** Symbol */
            symbol: string;
            /** From Stage */
            from_stage?: string | null;
            /** To Stage */
            to_stage: string;
            /** Price */
            price?: number | null;
            /** Context */
            context?: {
                [key: string]: unknown;
            } | null;
            /** Occurred At */
            occurred_at?: string | null;
        };
        /** StrategyResult */
        StrategyResult: {
            /** Name */
            name: string;
            /** Win Rate */
            win_rate: number;
            /** Match Count */
            match_count: number;
            /** Expectancy */
            expectancy: number;
        };
        /** TargetedPatternRow */
        TargetedPatternRow: {
            /** Symbol */
            symbol: string;
            /** Pattern */
            pattern: string;
            /** Sharpe */
            sharpe: number | null;
            /** Hit Rate */
            hit_rate: number | null;
            /** N Trades */
            n_trades: number | null;
            /** Expectancy Pct */
            expectancy_pct: number | null;
        };
        /** TargetedScanRequest */
        TargetedScanRequest: {
            /** Symbols */
            symbols?: string[] | null;
            /** Draft */
            draft?: {
                [key: string]: unknown;
            } | null;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /**
             * Top N
             * @default 5
             */
            top_n: number;
        };
        /** TargetedScanResult */
        TargetedScanResult: {
            /** Top Patterns */
            top_patterns: components["schemas"]["TargetedPatternRow"][];
            /** Symbols Scanned */
            symbols_scanned: number;
            /** Elapsed S */
            elapsed_s: number;
            /** Cache Hit */
            cache_hit: boolean;
        };
        /** ThresholdDeltaOut */
        ThresholdDeltaOut: {
            /** Stop Mul Delta */
            stop_mul_delta: number;
            /** Entry Strict Delta */
            entry_strict_delta: number;
            /** Target Mul Delta */
            target_mul_delta: number;
            /** N Used */
            n_used: number;
            /** Shrinkage Factor */
            shrinkage_factor: number;
            /** Clamped */
            clamped: boolean;
        };
        /** TokenInfo */
        TokenInfo: {
            /** Rank */
            rank: number;
            /** Symbol */
            symbol: string;
            /** Base */
            base: string;
            /** Name */
            name: string;
            /** Sector */
            sector: string;
            /** Price */
            price: number;
            /** Pct 24H */
            pct_24h: number;
            /** Vol 24H Usd */
            vol_24h_usd: number;
            /** Market Cap */
            market_cap: number;
            /** Oi Usd */
            oi_usd: number;
            /** Is Futures */
            is_futures: boolean;
            /** Trending Score */
            trending_score: number;
        };
        /** TopPatternItem */
        TopPatternItem: {
            /** Pattern Slug */
            pattern_slug: string;
            /** Symbol */
            symbol: string | null;
            /** Direction */
            direction: string | null;
            /** Composite Score */
            composite_score: number | null;
            /** Quality Grade */
            quality_grade: string | null;
            /** N Trades Paper */
            n_trades_paper: number | null;
            /** Win Rate Paper */
            win_rate_paper: number | null;
            /** Sharpe Paper */
            sharpe_paper: number | null;
            /** Max Drawdown Pct Paper */
            max_drawdown_pct_paper: number | null;
            /** Expectancy Pct Paper */
            expectancy_pct_paper: number | null;
            /** Model Source */
            model_source?: string | null;
        };
        /** TopPatternsResponse */
        TopPatternsResponse: {
            /** Patterns */
            patterns: components["schemas"]["TopPatternItem"][];
            /** Generated At */
            generated_at: string | null;
            /** Pipeline Run Id */
            pipeline_run_id: string | null;
            /** Total Available */
            total_available: number;
            /** Limit Applied */
            limit_applied: number;
        };
        /** TradeRecord */
        TradeRecord: {
            /** Snapshot */
            snapshot: {
                [key: string]: unknown;
            };
            /** Outcome */
            outcome: number;
        };
        /** TrainRequest */
        TrainRequest: {
            /** Records */
            records: components["schemas"]["TradeRecord"][];
        };
        /** TrainResponse */
        TrainResponse: {
            /** Auc */
            auc: number;
            /** N Samples */
            n_samples: number;
            /** Model Version */
            model_version: string;
        };
        /** TvFitRequest */
        TvFitRequest: {
            /** Url */
            url: string;
        };
        /** UniverseRequest */
        UniverseRequest: {
            /**
             * Top N
             * @default 10
             */
            top_n: number;
            /**
             * Min Vol M
             * @default 3
             */
            min_vol_m: number;
            /**
             * Question
             * @default
             */
            question: string;
            /**
             * User Id
             * @default engine
             */
            user_id: string;
            /**
             * Equity Usd
             * @default 10000
             */
            equity_usd: number;
        };
        /** UniverseResponse */
        UniverseResponse: {
            /** Total */
            total: number;
            /** Tokens */
            tokens: components["schemas"]["TokenInfo"][];
            /** Updated At */
            updated_at: string;
        };
        /** ValidateRequest */
        ValidateRequest: {
            /** Slug */
            slug: string;
            /** Symbol */
            symbol: string;
            /** Timeframe */
            timeframe: string;
            /** Family */
            family?: string | null;
            /**
             * Existing Promotion Pass
             * @default false
             */
            existing_promotion_pass: boolean;
        };
        /** ValidateResponse */
        ValidateResponse: {
            /** Slug */
            slug: string;
            /** Overall Pass */
            overall_pass: boolean;
            /** Stage */
            stage: string;
            /** Hypothesis Id */
            hypothesis_id: string | null;
            /** Dsr N Trials */
            dsr_n_trials: number;
            /** Family */
            family: string;
            /** Computed At */
            computed_at: string;
            /** Error */
            error: string | null;
            /** Gate */
            gate: {
                [key: string]: unknown;
            } | null;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
        };
        /** VariantOut */
        VariantOut: {
            /** Pattern Slug */
            pattern_slug: string;
            /** Variant Slug */
            variant_slug: string;
            /** Timeframe */
            timeframe: string;
            /** Mode */
            mode: string;
            delta: components["schemas"]["ThresholdDeltaOut"] | null;
            /** Base Variant Slug */
            base_variant_slug: string;
            /** Resolved At */
            resolved_at: string;
        };
        /**
         * VerdictBar
         * @description One bar after the signal bar.
         */
        VerdictBar: {
            /** H */
            h: number;
            /** L */
            l: number;
            /** C */
            c: number;
        };
        /** WatchCreate */
        WatchCreate: {
            /** User Id */
            user_id: string;
            /** Symbol */
            symbol: string;
            /**
             * Trigger Kind
             * @default price_drop_pct
             */
            trigger_kind: string;
            /**
             * Threshold Pct
             * @default 5
             */
            threshold_pct: number;
            /** Baseline Price */
            baseline_price: number;
        };
        /** WindowAggResponse */
        WindowAggResponse: {
            /**
             * N Total
             * @default 0
             */
            n_total: number;
            /**
             * N Closed
             * @default 0
             */
            n_closed: number;
            /**
             * N Wins
             * @default 0
             */
            n_wins: number;
            /** Win Rate */
            win_rate?: number | null;
            /** Ci95 Lo */
            ci95_lo?: number | null;
            /** Ci95 Hi */
            ci95_hi?: number | null;
            /** Avg Pnl Pct */
            avg_pnl_pct?: number | null;
            /** Avg Pnl Ci95 Lo */
            avg_pnl_ci95_lo?: number | null;
            /** Avg Pnl Ci95 Hi */
            avg_pnl_ci95_hi?: number | null;
        };
        /** _BenchmarkPackDraftBody */
        _BenchmarkPackDraftBody: {
            /** Capture Id */
            capture_id: string;
            /**
             * Max Holdouts
             * @default 4
             */
            max_holdouts: number;
        };
        /** _BenchmarkSearchBody */
        _BenchmarkSearchBody: {
            /** Capture Id */
            capture_id: string;
            /**
             * Max Holdouts
             * @default 4
             */
            max_holdouts: number;
        };
        /** _CaptureBody */
        _CaptureBody: {
            /** Symbol */
            symbol: string;
            /**
             * Phase
             * @default
             */
            phase: string;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /**
             * Capture Kind
             * @default pattern_candidate
             */
            capture_kind: string;
            /** Candidate Transition Id */
            candidate_transition_id?: string | null;
            /** Scan Id */
            scan_id?: string | null;
            /** User Note */
            user_note?: string | null;
            /**
             * Chart Context
             * @default {}
             */
            chart_context: {
                [key: string]: unknown;
            };
            /** Feature Snapshot */
            feature_snapshot?: {
                [key: string]: unknown;
            } | null;
            /**
             * Block Scores
             * @default {}
             */
            block_scores: {
                [key: string]: unknown;
            };
            /** Outcome Id */
            outcome_id?: string | null;
            /** Verdict Id */
            verdict_id?: string | null;
        };
        /** _FindBody */
        _FindBody: {
            /** Conditions */
            conditions: components["schemas"]["_FindCondition"][];
            /**
             * Min Match
             * @default 1
             */
            min_match: number;
            /**
             * Universe
             * @default alpha
             */
            universe: string;
        };
        /** _FindCondition */
        _FindCondition: {
            /** Block */
            block?: string | null;
            /** Feature */
            feature?: string | null;
            /** Op */
            op?: string | null;
            /** Value */
            value?: number | null;
            /** Persist Bars */
            persist_bars?: number | null;
        };
        /** _PatternAlertPolicyBody */
        _PatternAlertPolicyBody: {
            /** Mode */
            mode: string;
        };
        /** _PatternStatusBody */
        _PatternStatusBody: {
            /** Status */
            status: string;
            /**
             * Reason
             * @default
             */
            reason: string;
        };
        /** _PatternTrainBody */
        _PatternTrainBody: {
            /** Definition Id */
            definition_id?: string | null;
            /**
             * Target Name
             * @default breakout
             */
            target_name: string;
            /**
             * Feature Schema Version
             * @default 1
             */
            feature_schema_version: number;
            /**
             * Label Policy Version
             * @default 1
             */
            label_policy_version: number;
            /**
             * Threshold Policy Version
             * @default 1
             */
            threshold_policy_version: number;
            /** Min Records */
            min_records?: number | null;
        };
        /** _PromotePatternModelBody */
        _PromotePatternModelBody: {
            /** Definition Id */
            definition_id?: string | null;
            /** Model Key */
            model_key: string;
            /** Model Version */
            model_version: string;
            /**
             * Threshold Policy Version
             * @default 1
             */
            threshold_policy_version: number;
        };
        /** _RegisterPatternBody */
        _RegisterPatternBody: {
            /** Slug */
            slug: string;
            /** Name */
            name: string;
            /** Description */
            description: string;
            /** Phases */
            phases: {
                [key: string]: unknown;
            }[];
            /** Entry Phase */
            entry_phase: string;
            /** Target Phase */
            target_phase: string;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /**
             * Tags
             * @default []
             */
            tags: string[];
        };
        /** _VizRouteBody */
        _VizRouteBody: {
            /** Capture Id */
            capture_id?: string | null;
            /** Intent */
            intent?: ("WHY" | "STATE" | "COMPARE" | "SEARCH" | "FLOW" | "EXECUTION") | null;
            /** Text Input */
            text_input?: string | null;
            /** Symbol */
            symbol?: string | null;
        };
        /** _WatchBody */
        _WatchBody: {
            /** Symbol */
            symbol: string;
            /** Target Phase */
            target_phase: string;
            /**
             * Min Confidence
             * @default 0.7
             */
            min_confidence: number;
            /** Notify Channels */
            notify_channels?: string[];
            /**
             * Expires Hours
             * @default 168
             */
            expires_hours: number;
        };
        /** _WikiPutBody */
        _WikiPutBody: {
            /** Body Md */
            body_md: string;
        };
        /** UniverseScanRequest */
        api__routes__agent_scan__UniverseScanRequest: {
            /** Symbols */
            symbols?: string[] | null;
            /**
             * Timeframe
             * @default 1h
             */
            timeframe: string;
            /**
             * Top N
             * @default 10
             */
            top_n: number;
        };
        /** _VerdictBody */
        api__routes__captures___VerdictBody: {
            /**
             * Verdict
             * @enum {string}
             */
            verdict: "valid" | "invalid" | "near_miss" | "too_early" | "too_late";
            /** User Note */
            user_note?: string | null;
        };
        /** _VerdictBody */
        api__routes__live_signals___VerdictBody: {
            /** Signal Id */
            signal_id: string;
            /** Symbol */
            symbol: string;
            /** Phase */
            phase: string;
            /** Verdict */
            verdict: string;
            /** Note */
            note?: string | null;
        };
        /** ParseRequest */
        api__routes__patterns__ParseRequest: {
            /** Text */
            text: string;
            /** Symbol */
            symbol?: string | null;
        };
        /** _VerdictBody */
        api__routes__patterns___VerdictBody: {
            /** Symbol */
            symbol: string;
            /** Verdict */
            verdict: string;
        };
        /** VerdictResponse */
        api__routes__patterns_verdicts__VerdictResponse: {
            /** Pattern Slug */
            pattern_slug: string;
            all?: components["schemas"]["WindowAggResponse"];
            last_90d?: components["schemas"]["WindowAggResponse"];
            /**
             * Confidence
             * @default insufficient
             */
            confidence: string;
            /** Last Computed Position Id */
            last_computed_position_id?: string | null;
            /** Updated At */
            updated_at?: string | null;
        };
        /** ScanRequest */
        api__routes__scanner__ScanRequest: {
            /** Symbols */
            symbols?: string[] | null;
            /**
             * Send Alerts
             * @default true
             */
            send_alerts: boolean;
        };
        /** ScanResponse */
        api__routes__scanner__ScanResponse: {
            /** Scanned At */
            scanned_at: string;
            /** N Symbols */
            n_symbols: number;
            /** N Signals */
            n_signals: number;
            /** Signals */
            signals: {
                [key: string]: unknown;
            }[];
            /** Errors */
            errors: string[];
            /** Duration Sec */
            duration_sec: number;
        };
        /** BacktestRequest */
        api__routes__user_screener__BacktestRequest: {
            /** Dsl */
            dsl: string;
            /** Symbols */
            symbols: string[];
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /**
             * Lookback Days
             * @default 90
             */
            lookback_days: number;
        };
        /** ParseRequest */
        api__routes__user_screener__ParseRequest: {
            /** Dsl */
            dsl: string;
        };
        /** ScanRequest */
        api__routes__user_screener__ScanRequest: {
            /** Dsl */
            dsl: string;
            /**
             * Symbol
             * @default BTCUSDT
             */
            symbol: string;
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /**
             * Lookback Days
             * @default 90
             */
            lookback_days: number;
        };
        /** UniverseScanRequest */
        api__routes__user_screener__UniverseScanRequest: {
            /** Dsl */
            dsl: string;
            /** Symbols */
            symbols: string[];
            /**
             * Timeframe
             * @default 4h
             */
            timeframe: string;
            /**
             * Max Hits
             * @default 50
             */
            max_hits: number;
        };
        /** VerdictRequest */
        api__routes__verdict__VerdictRequest: {
            /** Entry Price */
            entry_price: number;
            /**
             * Direction
             * @default long
             */
            direction: string;
            /** Bars After */
            bars_after: components["schemas"]["VerdictBar"][];
            /**
             * Target Pct
             * @default 0.01
             */
            target_pct: number;
            /**
             * Stop Pct
             * @default 0.01
             */
            stop_pct: number;
            /**
             * Max Bars
             * @default 24
             */
            max_bars: number;
        };
        /** VerdictResponse */
        api__routes__verdict__VerdictResponse: {
            /** Outcome */
            outcome: string;
            /** Pnl Pct */
            pnl_pct: number;
            /** Bars Held */
            bars_held: number;
            /** Exit Price */
            exit_price: number;
            /** Max Favorable */
            max_favorable: number;
            /** Max Adverse */
            max_adverse: number;
            /** Direction */
            direction: string;
        };
        /** BacktestRequest */
        api__schemas_backtest__BacktestRequest: {
            blocks: components["schemas"]["BlockSet"];
            config?: components["schemas"]["BacktestConfig"];
        };
        /** ScanRequest */
        api__schemas_search__ScanRequest: {
            /** Definition Id */
            definition_id?: string | null;
            /** Symbol */
            symbol?: string | null;
            /** Timeframe */
            timeframe?: string | null;
            /**
             * Limit
             * @default 20
             */
            limit: number;
        };
        /** ScanResponse */
        api__schemas_search__ScanResponse: {
            /**
             * Ok
             * @default true
             */
            ok: boolean;
            /**
             * Owner
             * @default engine
             * @constant
             */
            owner: "engine";
            /**
             * Plane
             * @default search
             * @constant
             */
            plane: "search";
            /** Status */
            status: string;
            /** Generated At */
            generated_at: string;
            /** Scan Id */
            scan_id: string;
            /** Request */
            request?: {
                [key: string]: unknown;
            };
            /** Candidates */
            candidates?: components["schemas"]["SearchCandidate"][];
        };
        /** VerdictRequest */
        personalization__api__VerdictRequest: {
            /** User Id */
            user_id: string;
            /** Pattern Slug */
            pattern_slug: string;
            /**
             * Verdict
             * @enum {string}
             */
            verdict: "valid" | "invalid" | "near_miss" | "too_early" | "too_late";
            /** Captured At */
            captured_at: string;
        };
        /** VerdictResponse */
        personalization__api__VerdictResponse: {
            /** Mode */
            mode: string;
            delta: components["schemas"]["ThresholdDeltaOut"] | null;
            /** Affinity Score */
            affinity_score: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    chart_klines_chart_klines_get: {
        parameters: {
            query?: {
                /** @description Trading pair, e.g. BTCUSDT */
                symbol?: string;
                /** @description Timeframe string, e.g. 1h / 4h / 1d */
                tf?: string;
                /** @description Number of bars to return */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    score_score_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScoreRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScoreResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deep_deep_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeepRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeepResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ctx_status_ctx_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    ctx_refresh_ctx_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    ctx_kimchi_premium_ctx_kimchi_premium_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    ctx_fact_ctx_fact_get: {
        parameters: {
            query: {
                symbol: string;
                timeframe?: string;
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_price_context_facts_price_context_get: {
        parameters: {
            query: {
                symbol: string;
                timeframe?: string;
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_perp_context_facts_perp_context_get: {
        parameters: {
            query: {
                symbol: string;
                timeframe?: string;
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_reference_stack_facts_reference_stack_get: {
        parameters: {
            query?: {
                symbol?: string;
                timeframe?: string;
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_chain_intel_facts_chain_intel_get: {
        parameters: {
            query?: {
                symbol?: string;
                chain?: string;
                family?: string | null;
                timeframe?: string;
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_market_cap_facts_market_cap_get: {
        parameters: {
            query?: {
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_confluence_facts_confluence_get: {
        parameters: {
            query: {
                symbol: string;
                timeframe?: string;
                offline?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    facts_indicator_catalog_facts_indicator_catalog_get: {
        parameters: {
            query?: {
                status?: string | null;
                family?: string | null;
                stage?: string | null;
                query?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_catalog_search_catalog_get: {
        parameters: {
            query?: {
                symbol?: string | null;
                timeframe?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchCatalogResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_seed_search_seed_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SeedSearchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SeedSearchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_seed_result_search_seed__run_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SeedSearchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_scan_search_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__schemas_search__ScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["api__schemas_search__ScanResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_scan_result_search_scan__scan_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                scan_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["api__schemas_search__ScanResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_query_spec_transform_search_query_spec_transform_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PatternDraftTransformRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatternDraftTransformResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_similar_search_similar_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SimilarSearchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimilarSearchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_similar_result_search_similar__run_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimilarSearchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_quality_judge_search_quality_judge_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["QualityJudgementRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QualityJudgementResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_quality_stats_search_quality_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QualityStatsResponse"];
                };
            };
        };
    };
    list_runtime_captures_runtime_captures_get: {
        parameters: {
            query?: {
                definition_id?: string | null;
                pattern_slug?: string | null;
                symbol?: string | null;
                status?: string | null;
                watching?: boolean | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeCaptureListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_runtime_capture_runtime_captures_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaptureCreateBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeCaptureResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_runtime_capture_runtime_captures__capture_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeCaptureResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_runtime_definitions_runtime_definitions_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimePatternDefinitionListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_runtime_definition_runtime_definitions__pattern_slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pattern_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimePatternDefinitionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_workspace_pin_runtime_workspace_pins_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RuntimeWorkspacePinCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeWorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_workspace_runtime_workspace__symbol__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeWorkspaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_setup_runtime_setups_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RuntimeSetupCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeSetupResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_setup_runtime_setups__setup_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                setup_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeSetupResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_research_context_runtime_research_contexts_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RuntimeResearchContextCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeResearchContextResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_research_context_runtime_research_contexts__context_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                context_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeResearchContextResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_ledger_runtime_ledger__ledger_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                ledger_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeLedgerResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_ledger_runtime_ledger_get: {
        parameters: {
            query?: {
                definition_id?: string | null;
                kind?: string | null;
                subject_id?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeLedgerListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    universe_universe_get: {
        parameters: {
            query?: {
                limit?: number;
                /** @description Filter by sector (empty = all) */
                sector?: string;
                /** @description rank | vol | trending | oi | pct24h */
                sort?: string;
                /** @description Force cache refresh */
                refresh?: boolean;
                /** @description Token symbol, name, or contract search */
                q?: string;
                /** @description Allow live provider fallback on local index miss */
                live_fallback?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UniverseResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    sectors_universe_sectors_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    market_search_status_universe_search_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    run_opportunity_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OpportunityRunRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OpportunityRunResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    backtest_backtest_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__schemas_backtest__BacktestRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BacktestResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_challenge_challenge_create_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChallengeCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChallengeCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    scan_challenge_challenge__slug__scan_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChallengeScanResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    train_train_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TrainRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TrainResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    train_report_train_report_get: {
        parameters: {
            query?: {
                top_k?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verdict_verdict_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__verdict__VerdictRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["api__routes__verdict__VerdictResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    trigger_scan_scanner_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["api__routes__scanner__ScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["api__routes__scanner__ScanResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    selection_gate_selection_gate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SelectionGateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SelectionGateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    parse_pattern_text_patterns_parse_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__patterns__ParseRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatternDraftBody"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_patterns_patterns_library_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_pattern_registry_patterns_registry_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_active_variants_patterns_active_variants_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_all_states_patterns_states_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_recent_transitions_patterns_transitions_get: {
        parameters: {
            query?: {
                limit?: number;
                symbol?: string | null;
                slug?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_all_candidates_patterns_candidates_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    draft_from_range_patterns_draft_from_range_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RangeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatternDraftBody"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    trigger_pattern_scan_patterns_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_all_stats_patterns_stats_all_get: {
        parameters: {
            query?: {
                definition_scope?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_lifecycle_statuses_patterns_lifecycle_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_candidates_patterns__slug__candidates_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_similar_live_patterns__slug__similar_live_get: {
        parameters: {
            query?: {
                variant_slug?: string | null;
                timeframe?: string | null;
                top_k?: number;
                min_similarity_score?: number;
                window_bars?: number;
                staleness_hours?: number;
                warmup_bars?: number;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_f60_gate_status_patterns__slug__f60_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_stats_patterns__slug__stats_get: {
        parameters: {
            query?: {
                definition_id?: string | null;
                definition_scope?: string;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pnl_stats_patterns__slug__pnl_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PnLStatsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_trades_patterns__slug__trades_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_training_records_patterns__slug__training_records_get: {
        parameters: {
            query?: {
                limit?: number;
                definition_id?: string | null;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alert_policy_patterns__slug__alert_policy_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    set_alert_policy_patterns__slug__alert_policy_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_PatternAlertPolicyBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_lifecycle_status_patterns__slug__lifecycle_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    patch_pattern_status_patterns__slug__status_patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_PatternStatusBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_model_registry_patterns__slug__model_registry_get: {
        parameters: {
            query?: {
                definition_id?: string | null;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_model_history_patterns__slug__model_history_get: {
        parameters: {
            query?: {
                limit?: number;
                definition_id?: string | null;
                record_type?: string | null;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_def_patterns__slug__library_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_verdict_patterns__slug__verdict_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["api__routes__patterns_verdicts__VerdictResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    set_user_verdict_patterns__slug__verdict_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__patterns___VerdictBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    record_capture_patterns__slug__capture_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_CaptureBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    auto_evaluate_patterns__slug__evaluate_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    train_pattern_model_patterns__slug__train_model_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_PatternTrainBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    promote_pattern_model_patterns__slug__promote_model_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_PromotePatternModelBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    register_pattern_patterns_register_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_RegisterPatternBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_benchmark_pack_draft_patterns__slug__benchmark_pack_draft_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_BenchmarkPackDraftBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    run_benchmark_search_from_capture_patterns__slug__benchmark_search_from_capture_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_BenchmarkSearchBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_pattern_objects_patterns_objects_get: {
        parameters: {
            query?: {
                phase?: string | null;
                tag?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatternObjectResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_object_patterns_objects__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatternObjectResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_paper_patterns__slug__verify_paper_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_backtest_patterns__slug__backtest_get: {
        parameters: {
            query?: {
                tf?: string;
                universe?: string;
                since_days?: number;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_signals_patterns__slug__signals_get: {
        parameters: {
            query?: {
                days?: number;
                limit?: number;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    compare_patterns_patterns_compare_get: {
        parameters: {
            query: {
                slugs: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    }[];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    spawn_paper_patterns__slug__spawn_paper_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PatternPaperSpawnBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PatternPaperSpawnResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_verdicts_patterns_verdicts_get: {
        parameters: {
            query: {
                slugs: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["api__routes__patterns_verdicts__VerdictResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_captures_captures_get: {
        parameters: {
            query?: {
                user_id?: string | null;
                pattern_slug?: string | null;
                symbol?: string | null;
                status?: string | null;
                watching?: boolean | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_capture_captures_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaptureCreateBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bulk_import_captures_captures_bulk_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BulkImportBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_verdict_inbox_captures_outcomes_get: {
        parameters: {
            query?: {
                user_id?: string | null;
                pattern_slug?: string | null;
                symbol?: string | null;
                status?: "outcome_ready" | "verdict_ready";
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    set_capture_verdict_captures__capture_id__verdict_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__captures___VerdictBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_capture_benchmark_pack_draft_captures__capture_id__benchmark_pack_draft_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CaptureBenchmarkSearchBody"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_capture_benchmark_search_captures__capture_id__benchmark_search_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CaptureBenchmarkSearchBody"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_chart_annotations_captures_chart_annotations_get: {
        parameters: {
            query: {
                user_id?: string | null;
                /** @description e.g. BTCUSDT */
                symbol: string;
                timeframe?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    watch_capture_captures__capture_id__watch_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_verdict_deeplink_captures__capture_id__verdict_link_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_capture_captures__capture_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                capture_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_query_memory_query_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemoryQueryRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryQueryResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_feedback_memory_feedback_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemoryFeedbackRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryFeedbackResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_feedback_batch_memory_feedback_batch_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemoryFeedbackBatchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryFeedbackBatchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_debug_session_memory_debug_session_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemoryDebugSessionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryDebugSessionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_rejected_search_memory_rejected_search_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemoryRejectedLookupRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryRejectedLookupResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    latest_run_screener_runs_latest_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    listings_screener_listings_get: {
        parameters: {
            query?: {
                /** @description A | B | C | excluded */
                grade?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    asset_detail_screener_assets__symbol__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    filtered_universe_screener_universe_get: {
        parameters: {
            query?: {
                /** @description A | B */
                min_grade?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    terminal_scan_rag_terminal_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RagTerminalScanEmbeddingRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RagVectorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    quick_trade_rag_quick_trade_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RagQuickTradeEmbeddingRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RagVectorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    signal_action_rag_signal_action_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RagSignalActionEmbeddingRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RagVectorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    dedupe_hash_rag_dedupe_hash_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RagDedupeHashRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RagDedupeHashResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_live_signals_live_signals_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    post_verdict_live_signals_verdict_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__live_signals___VerdictBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    flywheel_health_observability_flywheel_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    agent_status_observability_agent_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    gainers_dalkkak_gainers_get: {
        parameters: {
            query?: {
                top_n?: number;
                /** @description 최소 24h 거래량 */
                min_volume_usdt?: number;
                /** @description 최소 상승률 % */
                min_price_change_pct?: number;
                /** @description 신규 상장 기준일 */
                new_listing_days?: number;
                /** @description 신규 상장 가중치 */
                new_listing_boost?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_positions_dalkkak_positions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    open_position_dalkkak_positions_open_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OpenPositionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    close_position_dalkkak_positions_close_post: {
        parameters: {
            query: {
                /** @description 심볼 예: BTCUSDT */
                symbol: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    caption_dalkkak_caption_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaptionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    losers_dalkkak_losers_get: {
        parameters: {
            query?: {
                top_n?: number;
                min_volume_usdt?: number;
                /** @description 최대 하락률 % (음수) */
                max_price_change_pct?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    trending_dalkkak_trending_get: {
        parameters: {
            query?: {
                top_n?: number;
                /** @description 트렌딩 최소 거래량 */
                min_volume_usdt?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    portfolio_dalkkak_portfolio_get: {
        parameters: {
            query?: {
                /** @description 초기 자본 USDT */
                initial_balance?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    risk_plan_dalkkak_risk_get: {
        parameters: {
            query: {
                /** @description 진입가 USDT */
                entry_price: number;
                /** @description 현재 ATR (USDT) */
                atr: number;
                /** @description 계좌 자본 USDT (kelly_plan 용) */
                equity?: number;
                /** @description EWMA annualized vol (0=bootstrap) */
                realized_annual_vol?: number;
                /** @description trend_up|trend_down|range|high_vol */
                regime?: string;
                /** @description long|short */
                side?: string;
                /** @description conservative|standard|aggressive|scalper */
                profile?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_world_model_alpha_world_model_get: {
        parameters: {
            query?: {
                grade?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_token_detail_alpha_token__symbol__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_token_history_alpha_token__symbol__history_get: {
        parameters: {
            query?: {
                since?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_anomalies_alpha_anomalies_get: {
        parameters: {
            query?: {
                investigated?: boolean;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    post_alpha_watch_alpha_watch_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_WatchBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    post_alpha_find_alpha_find_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_FindBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_scroll_alpha_scroll_get: {
        parameters: {
            query: {
                symbol: string;
                from_ts: string;
                to_ts: string;
                timeframe?: string;
                top_k?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_scan_alpha_scan_get: {
        parameters: {
            query?: {
                symbols?: string | null;
                universe?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_all_stats_refinement_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_pattern_stats_refinement_stats__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_suggestions_refinement_suggestions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_leaderboard_refinement_leaderboard_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_feature_window_features_window_get: {
        parameters: {
            query: {
                symbol: string;
                timeframe?: string;
                venue?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_events_features_pattern_events_get: {
        parameters: {
            query: {
                symbol: string;
                timeframe?: string;
                venue?: string;
                pattern_family?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    logout_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogoutResponse"];
                };
            };
        };
    };
    get_f60_status_users__user_id__f60_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_verdict_accuracy_users__user_id__verdict_accuracy_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_user_wvpl_metrics_user__user_id__wvpl_get: {
        parameters: {
            query?: {
                weeks?: number;
            };
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    route_viz_intent_viz_route_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_VizRouteBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    post_verdict_personalization_verdict_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["personalization__api__VerdictRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["personalization__api__VerdictResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_variant_personalization_user__user_id__variant__pattern_slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
                pattern_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VariantOut"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_affinity_personalization_user__user_id__affinity_get: {
        parameters: {
            query?: {
                top_k?: number;
            };
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AffinityListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    post_rescue_personalization_user__user_id__rescue__pattern_slug__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
                pattern_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RescueResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    validate_pattern_research_validate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ValidateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    discover_research_discover_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiscoverResponse"];
                };
            };
        };
    };
    trigger_autoresearch_research_autoresearch_trigger_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutoresearchTriggerResponse"];
                };
            };
        };
    };
    get_signals_research_signals__symbol__get: {
        parameters: {
            query?: {
                /** @description e.g. 1h, 6h, 24h, 7d */
                lookback?: string;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SignalsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_run_research_runs__run_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunOut"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_findings_research_findings_get: {
        parameters: {
            query?: {
                date?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FindingsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alpha_quality_research_alpha_quality_get: {
        parameters: {
            query?: {
                lookback?: string;
                pattern_slug?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    market_search_research_market_search_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MarketSearchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MarketSearchResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_indicator_features_research_indicator_features_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_signal_components_research_signals__signal_id__components_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                signal_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_top_patterns_research_top_patterns_get: {
        parameters: {
            query?: {
                limit?: number;
                min_grade?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TopPatternsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_formula_evidence_research_formula_evidence_get: {
        parameters: {
            query?: {
                /** @description filter_rule | pattern */
                scope?: string;
                period_days?: number;
                min_sample?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FormulaEvidenceItem"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_blocked_candidates_research_blocked_candidates_get: {
        parameters: {
            query?: {
                /** @description Filter by filter_reason code */
                reason?: string | null;
                /** @description Filter by symbol */
                symbol?: string | null;
                period_days?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlockedCandidateItem"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_rules_research_rules_get: {
        parameters: {
            query?: {
                user_id?: string | null;
                state?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuleOut"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_rule_research_rules_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateRuleRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuleOut"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_autoresearch_signals_research_autoresearch_signals_get: {
        parameters: {
            query?: {
                limit?: number;
                min_sharpe?: number;
                timeframe?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AutoresearchSignalsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    targeted_autoresearch_research_autoresearch_targeted_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TargetedScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TargetedScanResult"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_bucket_attribution_research_bucket_attribution_get: {
        parameters: {
            query: {
                /** @description 5D bucket key e.g. BTCUSDT|15m|2|2|long */
                key: string;
                /** @description Include all 3 mode classifications */
                by_mode?: boolean;
                recent_limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BucketAttributionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_bucket_attribution_research_bucket_attribution_list_get: {
        parameters: {
            query?: {
                /** @description Filter by status under `mode` (default standard) */
                status?: string | null;
                /** @description Threshold mode for status filter */
                mode?: string;
                /** @description Minimum n to include */
                min_n?: number;
                /** @description Filter by symbol prefix */
                symbol?: string | null;
                /** @description Filter by timeframe */
                tf?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BucketListItem"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_summary_propfirm_summary_get: {
        parameters: {
            query: {
                user_id: string;
                account_id?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_account_propfirm_accounts_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAccountBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    confirm_payment_propfirm_payment_confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmPaymentRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    explain_agent_explain_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExplainRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    alpha_scan_agent_alpha_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlphaScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    similar_agent_similar_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SimilarRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AgentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    judge_agent_judge_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["JudgeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JudgeResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    save_agent_save_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SaveRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SaveResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_available_models_agent_chat_models_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    agent_chat_agent_chat_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChatRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_scratchpad_runs_agent_scratchpad_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_scratchpad_agent_scratchpad__run_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    trading_map_preview_agent_trading_map_preview_get: {
        parameters: {
            query?: {
                symbol?: string;
                message?: string;
                top_k?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    outcome_rag_preview_agent_outcome_rag_preview_get: {
        parameters: {
            query?: {
                symbol?: string;
                action?: string;
                reason?: string;
                top_k?: number;
                window_days?: number;
                corpus_limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    universe_scan_agent_scan_universe_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__agent_scan__UniverseScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    position_verdict_agent_scan_position_verdict_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PositionVerdictRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_alerts_agent_alerts_get: {
        parameters: {
            query?: {
                /** @description comma-separated symbols (empty = default 5) */
                symbols?: string;
                lookback_min?: number;
                min_usd?: number;
                /** @description comma-separated alert types */
                types?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_watches_agent_advisor_watches_get: {
        parameters: {
            query?: {
                user_id?: string | null;
                status?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_watch_agent_advisor_watches_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WatchCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    cancel_watch_agent_advisor_watches__watch_id__delete: {
        parameters: {
            query: {
                user_id: string;
            };
            header?: never;
            path: {
                watch_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    tick_watches_agent_advisor_watches_tick_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    list_alerts_agent_advisor_alerts_get: {
        parameters: {
            query: {
                user_id: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_memories_agent_memories_get: {
        parameters: {
            query: {
                user_id: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_memory_agent_memories_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemoryCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_memory_agent_memories__memory_id__delete: {
        parameters: {
            query: {
                user_id: string;
            };
            header?: never;
            path: {
                memory_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    circuit_state_agent_circuit_state_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_altcoin_scan_agent_altcoin_scan_get: {
        parameters: {
            query: {
                /** @description Token symbol (e.g. LONGXIA, CHIP) */
                symbol: string;
                /** @description Position entry price */
                entry?: number | null;
                /** @description Leverage multiplier */
                leverage?: number;
                /** @description Include Groq LLM analysis */
                llm?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_altcoin_orderbook_agent_altcoin_orderbook_get: {
        parameters: {
            query: {
                /** @description Token symbol (e.g. LONGXIA, CHIP) */
                symbol: string;
                /** @description Position entry price */
                entry?: number | null;
                /** @description Leverage multiplier */
                leverage?: number;
                /** @description Take-profit target price */
                target?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    prepump_scan_agent_prepump_scan_get: {
        parameters: {
            query?: {
                top_n?: number;
                /** @description Min 24H vol USD millions */
                min_vol_m?: number;
                /** @description FIRE|ALERT|WATCH|ALL */
                level?: string;
                /** @description A|B|ALL — watchlist phase filter */
                phase?: string;
                squeeze?: boolean;
                structure?: boolean;
                bull_only?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    prepump_single_agent_prepump_single_get: {
        parameters: {
            query: {
                /** @description Symbol e.g. SOLUSDT */
                sym: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    prepump_onchain_agent_prepump_onchain_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    prepump_radar_agent_prepump_radar_get: {
        parameters: {
            query: {
                /** @description Comma-separated symbols e.g. SOLUSDT,AVAXUSDT (max 20) */
                syms: string;
                min_vol_m?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    prepump_trades_agent_prepump_trades_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    prepump_radar_stream_agent_prepump_radar_stream_get: {
        parameters: {
            query?: {
                /** @description Optional comma-separated symbol filter e.g. SOLUSDT,AVAXUSDT */
                syms?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    signal_hub_scan_agent_signal_hub_scan_get: {
        parameters: {
            query?: {
                top_n?: number;
                min_vol_m?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    signal_hub_symbol_agent_signal_hub_symbol__sym__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sym: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    signal_hub_decision_log_agent_signal_hub_decision_log_get: {
        parameters: {
            query?: {
                limit?: number;
                symbol?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    signal_hub_ic_weights_agent_signal_hub_ic_weights_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    krw_listing_radar_agent_krw_radar_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    krw_premium_agent_krw_premium_get: {
        parameters: {
            query?: {
                /** @description comma-separated symbols (e.g. BTC,ETH) */
                symbols?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    calendar_unlocks_agent_calendar_unlocks_get: {
        parameters: {
            query?: {
                /** @description comma-separated symbols */
                symbols?: string;
                min_usd?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    news_digest_agent_news_digest_get: {
        parameters: {
            query?: {
                /** @description comma-separated symbols */
                symbols?: string;
                window_h?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_ai_context_ai_context_get: {
        parameters: {
            query?: {
                symbol?: string;
                timeframe?: string;
                reference_price?: number | null;
                expected_move_bps?: number | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_terminal_agent_context_terminal_agent_context_get: {
        parameters: {
            query?: {
                symbol?: string;
                timeframe?: string;
                reference_price?: number | null;
                expected_move_bps?: number | null;
                raw_user_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_state_admin_kill_switch_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KillSwitchStateOut"];
                };
            };
        };
    };
    arm_admin_kill_switch_arm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArmRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KillSwitchStateOut"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    disarm_admin_kill_switch_disarm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ArmRequest"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KillSwitchStateOut"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_public_passport_passport__username__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_extreme_events_extreme_events_get: {
        parameters: {
            query?: {
                /** @description Lookback window e.g. 24h, 48h, 72h */
                since?: string;
                limit?: number;
                /** @description funding | oi | price | all */
                kind?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExtremeEventsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_counterfactual_review_lab_counterfactual_get: {
        parameters: {
            query?: {
                /** @description Look-back window in days */
                days?: number;
                /** @description Pattern slug or ALL */
                pattern?: string;
                /** @description Max rows in signal table */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CounterfactualReviewResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_filter_drag_patterns__slug__filter_drag_get: {
        parameters: {
            query?: {
                /** @description Simulated p_win threshold (0-1) */
                threshold?: number;
                /** @description Look-back in days */
                since?: number;
            };
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FilterDragResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_formula_patterns__slug__formula_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FormulaResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    preview_tv_import_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreviewRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    estimate_tv_import_estimate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EstimateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    commit_tv_import_commit_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommitRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_author_tv_import_author__username__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                username: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_twin_tv_import_twin__import_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                import_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    agent_tv_fit_agent_tv_fit_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TvFitRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_catalog_indicators_catalog_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_series_indicators_series_get: {
        parameters: {
            query: {
                /** @description Trading pair, e.g. BTCUSDT */
                symbol?: string;
                /** @description Timeframe, e.g. 15m / 1h */
                timeframe?: string;
                /** @description Indicator ID from /catalog */
                indicator: string;
                /** @description Param overrides: length:20,std:2.0 */
                params?: string | null;
                /** @description Number of input bars */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_aggregated_indicators_aggregated__type__get: {
        parameters: {
            query?: {
                /** @description Trading pair, e.g. BTCUSDT */
                symbol?: string;
                /** @description Max output points */
                limit?: number;
                /** @description OI/LS period bucket (1h, 4h, ...) */
                period?: string;
            };
            header?: never;
            path: {
                type: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_active_model_scoring_active_model_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActiveModelResponse"];
                };
            };
        };
    };
    trigger_digest_digest_digest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: number;
                    };
                };
            };
        };
    };
    opt_out_digest_digest_digest_opt_out__user_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    opt_in_digest_digest_digest_opt_in__user_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_cvd_cvd__symbol__get: {
        parameters: {
            query?: {
                /** @description Bar interval: 1m 5m 15m 30m 1h 4h */
                interval?: string;
                /** @description Number of bars to return */
                limit?: number;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_cvd_latest_cvd__symbol__latest_get: {
        parameters: {
            query?: {
                interval?: string;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_cvd_cvd_data__symbol__get: {
        parameters: {
            query?: {
                tf?: string;
                limit?: number;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_liq_zones_liq_zones__symbol__get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_smc_events_smc__symbol__get: {
        parameters: {
            query?: {
                tf?: string;
                /** @description comma-separated: fvg,bos,choch,ob */
                kind?: string | null;
                active_only?: boolean;
                limit?: number;
            };
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_basis_basis_get: {
        parameters: {
            query?: {
                /** @description Trading pair, e.g. BTCUSDT */
                symbol?: string;
                /** @description Number of rows to return */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_long_short_long_short_get: {
        parameters: {
            query?: {
                /** @description Trading pair, e.g. BTCUSDT */
                symbol?: string;
                /** @description Number of rows to return */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_fomc_macro_fomc_get: {
        parameters: {
            query?: {
                /** @description Number of events to return */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_cpi_macro_cpi_get: {
        parameters: {
            query?: {
                /** @description Number of CPI records */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_global_market_macro_global_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_venue_funding_daily_venue_funding_get: {
        parameters: {
            query?: {
                symbol?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_coinbase_premium_daily_coinbase_premium_get: {
        parameters: {
            query?: {
                days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_cme_cot_daily_cme_cot_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    list_meme_coins_meme_coins_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_meme_coin_meme_coins__symbol__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                symbol: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_profile_list_api_profile_list_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_active_profile_api_profile_active_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_profile_by_name_api_profile__name__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_wiki_page_wiki_user__page__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                page: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_global_pattern_wiki_wiki_patterns__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_pattern_wiki_page_wiki_user_patterns__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    put_pattern_wiki_page_wiki_user_patterns__slug__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["_WikiPutBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    phase_transitions_sse_events_phase_transitions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    ingest_nahonja_ingest_nahonja_post: {
        parameters: {
            query?: never;
            header?: {
                "x-wtd-ingest-key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NahonjaBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ingest_alpha_terminal_ingest_alpha_terminal_post: {
        parameters: {
            query?: never;
            header?: {
                "x-wtd-ingest-key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlphaTerminalBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ingest_liqpressuremap_ingest_liqpressuremap_post: {
        parameters: {
            query?: never;
            header?: {
                "x-wtd-ingest-key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LiqBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ingest_alpha_hunter_ingest_alpha_hunter_post: {
        parameters: {
            query?: never;
            header?: {
                "x-wtd-ingest-key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlphaHunterBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ingest_kimp_wave_ingest_kimp_wave_post: {
        parameters: {
            query?: never;
            header?: {
                "x-wtd-ingest-key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["KimpBatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_market_context_market_context_get: {
        parameters: {
            query: {
                symbol: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    parse_user_screener_parse_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__user_screener__ParseRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    universe_scan_user_screener_universe_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__user_screener__UniverseScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    backtest_user_screener_backtest_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__user_screener__BacktestRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_signals_user_screener_signals_get: {
        parameters: {
            query?: {
                screener_id?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    scan_user_screener_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__user_screener__ScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_analyze_advisor_analyze_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnalyzeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_analyze_mtf_advisor_analyze_mtf_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnalyzeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_universe_advisor_universe_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UniverseRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_decisions_advisor_decisions_get: {
        parameters: {
            query?: {
                symbol?: string | null;
                action?: string | null;
                window_days?: number;
                with_outcome_only?: boolean;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_health_advisor_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    advisor_calibration_status_advisor_calibration_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    advisor_metrics_advisor_metrics_get: {
        parameters: {
            query?: {
                n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_secondary_model_advisor_secondary_model_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    advisor_cost_burn_advisor_cost_burn_get: {
        parameters: {
            query?: {
                window_hours?: number;
                bucket?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_parse_failure_timeseries_advisor_parse_failure_timeseries_get: {
        parameters: {
            query?: {
                window_hours?: number;
                bucket?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_symbol_mix_advisor_symbol_mix_get: {
        parameters: {
            query?: {
                window_days?: number;
                top_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_latency_timeseries_advisor_latency_timeseries_get: {
        parameters: {
            query?: {
                window_hours?: number;
                bucket?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_rolling_accuracy_advisor_rolling_accuracy_get: {
        parameters: {
            query?: {
                window_days?: number;
                roll_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_trend_advisor_confidence_trend_get: {
        parameters: {
            query?: {
                window_days?: number;
                roll_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_accuracy_advisor_accuracy_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_confidence_heatmap_advisor_action_confidence_heatmap_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_mix_by_dow_advisor_action_mix_by_dow_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_mix_by_hour_advisor_action_mix_by_hour_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_mix_by_symbol_advisor_action_mix_by_symbol_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_mix_trend_advisor_action_mix_trend_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_reversal_latency_advisor_action_reversal_latency_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_action_transitions_advisor_action_transitions_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_by_action_advisor_confidence_by_action_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_histogram_advisor_confidence_histogram_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_outcome_bands_advisor_confidence_outcome_bands_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_outcome_correlation_advisor_confidence_outcome_correlation_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_quantiles_advisor_confidence_quantiles_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_confidence_ttl_correlation_advisor_confidence_ttl_correlation_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_day_of_week_accuracy_advisor_day_of_week_accuracy_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_day_of_week_confidence_advisor_day_of_week_confidence_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_day_of_week_decisions_advisor_day_of_week_decisions_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_decision_density_heatmap_advisor_decision_density_heatmap_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_decision_interarrival_advisor_decision_interarrival_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_decision_streak_per_symbol_advisor_decision_streak_per_symbol_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_decision_volume_advisor_decision_volume_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_hour_of_day_accuracy_advisor_hour_of_day_accuracy_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_hour_of_day_confidence_advisor_hour_of_day_confidence_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_hour_of_day_decisions_advisor_hour_of_day_decisions_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ic_advisor_ic_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_keep_rate_advisor_keep_rate_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_label_coverage_advisor_label_coverage_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_net_sharpe_advisor_net_sharpe_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_magnitude_advisor_outcome_magnitude_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_magnitude_by_action_advisor_outcome_magnitude_by_action_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_magnitude_by_dow_advisor_outcome_magnitude_by_dow_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_magnitude_by_hour_advisor_outcome_magnitude_by_hour_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_magnitude_by_symbol_advisor_outcome_magnitude_by_symbol_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_sign_by_action_advisor_outcome_sign_by_action_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_sign_by_dow_advisor_outcome_sign_by_dow_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_sign_by_hour_advisor_outcome_sign_by_hour_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_outcome_sign_by_symbol_advisor_outcome_sign_by_symbol_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_per_symbol_accuracy_advisor_per_symbol_accuracy_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_per_symbol_confidence_advisor_per_symbol_confidence_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_per_symbol_recency_advisor_per_symbol_recency_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_per_symbol_refusal_rate_advisor_per_symbol_refusal_rate_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_reference_price_drift_advisor_reference_price_drift_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_refusal_rate_by_dow_advisor_refusal_rate_by_dow_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_refusal_rate_by_hour_advisor_refusal_rate_by_hour_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_stale_decision_backlog_advisor_stale_decision_backlog_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_symbol_churn_rate_advisor_symbol_churn_rate_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_symbol_concentration_advisor_symbol_concentration_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ttl_by_action_advisor_ttl_by_action_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ttl_by_dow_advisor_ttl_by_dow_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ttl_by_hour_advisor_ttl_by_hour_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ttl_by_symbol_advisor_ttl_by_symbol_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ttl_distribution_advisor_ttl_distribution_get: {
        parameters: {
            query?: {
                window_days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    advisor_ttl_outcome_correlation_advisor_ttl_outcome_correlation_get: {
        parameters: {
            query?: {
                window_days?: number;
                min_n?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SlicerSpec"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_turns_turns_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_approvals_turns_approval_get: {
        parameters: {
            query?: {
                status?: string | null;
                user_hash?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_turn_turns__turn_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                turn_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    replay_turn_turns__turn_id__replay_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                turn_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplayRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_approval_turns_approval__token_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    confirm_approval_turns_approval__token_id__confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    run_pattern_scan_jobs_pattern_scan_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_outcome_resolver_jobs_outcome_resolver_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_auto_capture_jobs_auto_capture_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_market_search_index_refresh_jobs_market_search_index_refresh_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_db_cleanup_jobs_db_cleanup_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_feature_windows_build_jobs_feature_windows_build_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_feature_materialization_jobs_feature_materialization_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_raw_ingest_jobs_raw_ingest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_cvd_build_jobs_cvd_build_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_liq_zones_jobs_liq_zones_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_basis_build_jobs_basis_build_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_smc_scan_jobs_smc_scan_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_hourly_ingest_jobs_hourly_ingest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_pump_universe_klines_jobs_pump_universe_klines_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_pump_precursor_scan_jobs_pump_precursor_scan_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_backtest_refresh_jobs_backtest_refresh_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_backfill_signals_jobs_backfill_signals_run_post: {
        parameters: {
            query?: {
                days?: number;
                max_symbols?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    run_market_context_refresh_jobs_market_context_refresh_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_pipeline_runs_cleanup_jobs_pipeline_runs_cleanup_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t1_ingest_jobs_t1_ingest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t2_ingest_jobs_t2_ingest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t2_coinmetrics_jobs_t2_coinmetrics_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t2_bigquery_jobs_t2_bigquery_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t3_gecko_jobs_t3_gecko_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t3_ingest_jobs_t3_ingest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_t4_ingest_jobs_t4_ingest_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_weekly_ingest_cot_jobs_weekly_ingest_cot_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_daily_ingest_macro_jobs_daily_ingest_macro_run_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    data_lake_freshness_jobs_data_lake_freshness_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    jobs_status_jobs_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    jobs_freshness_jobs_freshness_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    run_plugin_job_jobs__job_name__run_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    healthz_healthz_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    readyz_readyz_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    metrics_metrics_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    scanner_status_scanner_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
}

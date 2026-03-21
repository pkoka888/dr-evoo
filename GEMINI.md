# Local Conductor Protocol

## Mandatory Mandate: Context-Driven Development
This workspace is managed by the **Conductor Extension**. 
- **Source of Truth**: All specifications, tech stack decisions, and implementation tracks reside in the `conductor/` directory.
- **Context Loading**: Before starting any task, read `conductor/index.md` and its referenced specs.
- **Planning**: All tasks MUST be tracked in the active `conductor/tracks/<track_id>/plan.md`.
- **Implementation**: Follow the `conductor/workflow.md` TDD and commit protocols.

## Agent Lifecycle
1. **Analyze**: Check `conductor/tracks.md` for active tracks.
2. **Execute**: Follow the sequential tasks in the track-specific `plan.md`.
3. **Validate**: Perform automated and manual verification as defined in `workflow.md`.

# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json
import typing

@allow_storage
@dataclass
class ClaimEntry:
    text: str
    verdict: str # "TRUE", "FALSE", "UNDETERMINED"
    reasoning: str

class FactChecker(gl.Contract):
    claims: TreeMap[str, ClaimEntry]

    def __init__(self):
        pass

    @gl.public.write
    def check_claim(self, claim_text: str):
        if not claim_text:
            raise gl.vm.UserError("[EXPECTED] Claim text cannot be empty")
            
        claim_id = str(len(self.claims))
        
        def leader_fn():
            prompt = f"""
            Analyze the following claim: "{claim_text}"
            Determine if it is factually TRUE, FALSE, or UNDETERMINED.
            Provide brief reasoning (max 2 sentences).
            Respond ONLY as JSON: {{"verdict": "TRUE"|"FALSE"|"UNDETERMINED", "reasoning": "..."}}
            """
            return gl.nondet.exec_prompt(prompt, response_format="json")

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            
            # Re-run independently
            my_res = leader_fn()
            
            # --- LLM Resilience Logic ---
            def get_norm_verdict(d):
                # Handle key variations and aggressive coercion
                v = d.get("verdict") or d.get("result") or "UNDETERMINED"
                return str(v).strip().upper()

            # The verdict must match exactly for consensus
            # Reasoning is allowed to vary (subjective detail)
            return get_norm_verdict(my_res) == get_norm_verdict(leaders_res.calldata)

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        
        # Defensive extraction for final storage
        final_verdict = str(result.get("verdict", "UNDETERMINED")).strip().upper()
        
        entry = ClaimEntry(
            text=claim_text,
            verdict=final_verdict,
            reasoning=result.get("reasoning", "No reasoning provided.")
        )
        self.claims[claim_id] = entry

    @gl.public.view
    def get_claims(self) -> dict[str, typing.Any]:
        return {k: {"text": v.text, "verdict": v.verdict, "reasoning": v.reasoning} for k, v in self.claims.items()}

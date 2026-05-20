from __future__ import annotations

import json
import os
from abc import ABC
from collections.abc import Iterator
from typing import Any

from dotenv import load_dotenv
from groq import Groq


load_dotenv()


class BaseAgent(ABC):
    system_prompt: str | None = None

    def __init__(
        self,
        *,
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.7,
        max_tokens: int = 1024,
        api_key: str | None = None,
        system_prompt: str | None = None,
    ) -> None:
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.system_prompt = system_prompt if system_prompt is not None else self.system_prompt
        self.client = Groq(api_key=api_key or os.getenv("GROQ_API_KEY"))

    def run(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt),
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content or ""

    def stream(self, prompt: str) -> Iterator[str]:
        response_stream = self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt),
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            stream=True,
        )

        for chunk in response_stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    def run_json(self, prompt: str) -> dict[str, Any]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt),
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content or "{}"

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise ValueError("Groq response was not valid JSON") from exc

        if not isinstance(parsed, dict):
            raise ValueError("Groq response JSON must be an object")

        return parsed

    def _build_messages(self, prompt: str) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = []

        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})

        messages.append({"role": "user", "content": prompt})
        return messages
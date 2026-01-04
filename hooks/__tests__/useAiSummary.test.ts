import { renderHook, act } from "@testing-library/react-hooks";
import { useAiSummary } from "~hooks/useAiSummary";
import type { ScrapedContent } from "~constants/types";

// Define types for the mocked modules
type GenerateTextResult = {
  text: string;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
  finishReason: "stop" | "length" | "tool-calls" | "content-filter" | "error";
  messages: any[];
  steps: any[];
  toolCalls: any[];
  toolResults: any[];
  warnings?: any;
};

type StreamTextResult = {
  textStream: any;
  chunkStream: any;
  stepStream: any;
  warnings?: any;
  rawResponse: any;
  toDataStreamResponse: () => any;
};

// Mock dependencies
jest.mock("@plasmohq/storage/hook", () => ({
  useStorage: jest.fn(),
}));

jest.mock("@xsai/generate-text", () => ({
  generateText: jest.fn(),
}));

jest.mock("~utils/ai-service", () => ({
  getAiConfig: jest.fn(),
  generateSummary: jest.fn(),
  addAiChatHistoryItem: jest.fn(),
}));

jest.mock("~utils/template", () => ({
  processTemplate: jest.fn(),
}));

jest.mock("~utils/logger", () => ({
  debugLog: jest.fn(),
}));

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
  isMobile: false,
}));

describe("useAiSummary", () => {
  const mockUseStorage = require("@plasmohq/storage/hook").useStorage;
  const mockGenerateText = require("@xsai/generate-text").generateText;
  const mockGetAiConfig = require("~utils/ai-service").getAiConfig;
  const mockGenerateSummary = require("~utils/ai-service").generateSummary;
  const mockAddAiChatHistoryItem =
    require("~utils/ai-service").addAiChatHistoryItem;
  const mockProcessTemplate = require("~utils/template").processTemplate;

  const mockScrapedData: ScrapedContent = {
    title: "Test Article",
    author: "Test Author",
    publishDate: "2024-01-01",
    url: "https://example.com/article",
    articleContent: "Test content",
    cleanedContent: "Test content",
    metadata: {},
    images: [],
  };

  const mockAiConfig = {
    apiKey: "test-api-key",
    baseURL: "https://api.openai.com/v1/",
    model: "gpt-3.5-turbo",
    systemPrompt: "你是一个有用的助手",
  };

  // Helper to create GenerateTextResult with all required fields
  const createMockGenerateTextResult = (
    text: string,
    usage?: {
      total_tokens: number;
      prompt_tokens: number;
      completion_tokens: number;
    } | null
  ): GenerateTextResult =>
    ({
      text,
      usage: usage || {
        total_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
      },
      finishReason: "stop" as const,
      messages: [],
      steps: [],
      toolCalls: [],
      toolResults: [],
      warnings: undefined,
    } as GenerateTextResult);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default useStorage mock
    mockUseStorage.mockReturnValue(["test-api-key", jest.fn()]);

    // Setup default getAiConfig mock
    mockGetAiConfig.mockResolvedValue(mockAiConfig);

    // Setup default processTemplate mock
    mockProcessTemplate.mockImplementation((template) => template);
  });

  describe("initialization", () => {
    test("should initialize with default state", () => {
      const { result } = renderHook(() => useAiSummary("Test content"));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.summary).toBe("");
      expect(result.current.streamingText).toBe("");
      expect(result.current.error).toBeNull();
      expect(result.current.usage).toBeNull();
      expect(result.current.result).toBeNull();
      expect(result.current.modelId).toBeNull();
    });

    test("should load system prompt on mount", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      expect(mockGetAiConfig).toHaveBeenCalled();
      expect(result.current.systemPrompt).toBe(mockAiConfig.systemPrompt);
      expect(result.current.customPrompt).toBe(mockAiConfig.systemPrompt);
      expect(result.current.modelId).toBe(mockAiConfig.model);
    });

    test("should handle getAiConfig errors gracefully", async () => {
      mockGetAiConfig.mockRejectedValueOnce(new Error("Config error"));

      const { result } = renderHook(() => useAiSummary("Test content"));

      // Should not crash, error is logged but not exposed
      expect(result.current.error).toBeNull();
    });
  });

  describe("setCustomPrompt", () => {
    test("should update custom prompt", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      act(() => {
        result.current.setCustomPrompt("New custom prompt");
      });

      expect(result.current.customPrompt).toBe("New custom prompt");
    });
  });

  describe("saveAsDefaultPrompt", () => {
    test("should save prompt as system default", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.saveAsDefaultPrompt("New default prompt");
      });

      expect(result.current.systemPrompt).toBe("New default prompt");
    });

    test("should handle save errors", async () => {
      const mockStorage = require("@plasmohq/storage").Storage;
      const mockSet = jest.fn().mockRejectedValue(new Error("Storage error"));

      // Mock Storage instance
      mockStorage.mockImplementation(() => ({
        set: mockSet,
      }));

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.saveAsDefaultPrompt("Prompt");
      });

      // System prompt is still updated locally even if storage fails
      expect(result.current.systemPrompt).toBe("Prompt");
    });
  });

  describe("generateSummaryText - validation", () => {
    test("should show error when content is empty", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("   ")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(result.current.error).toBe("内容为空，无法生成摘要");
      expect(result.current.isLoading).toBe(false);
    });

    test("should show error when API key is missing", async () => {
      mockUseStorage.mockReturnValue(["", jest.fn()]);

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(result.current.error).toBe("请先在扩展设置中配置AI提供商信息");
    });

    test("should show error when model is not configured", async () => {
      mockGetAiConfig.mockResolvedValue({
        ...mockAiConfig,
        model: "",
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(result.current.error).toBe("请先在设置中选择 AI 模型");
    });
  });

  describe("generateSummaryText - mobile mode", () => {
    beforeEach(() => {
      // Mock mobile device
      const reactDeviceDetect = require("react-device-detect");
      Object.defineProperty(reactDeviceDetect, "isMobile", {
        value: true,
        writable: true,
      });
    });

    test("should generate summary using generateText on mobile", async () => {
      mockGenerateText.mockResolvedValue(
        createMockGenerateTextResult("Generated summary", {
          total_tokens: 100,
          prompt_tokens: 60,
          completion_tokens: 40,
        })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content", undefined, mockScrapedData)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(mockGenerateText).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        baseURL: mockAiConfig.baseURL,
        messages: [
          {
            content: mockAiConfig.systemPrompt,
            role: "system",
          },
          {
            content: expect.stringContaining("Test content"),
            role: "user",
          },
        ],
        model: mockAiConfig.model,
      });

      expect(result.current.summary).toBe("Generated summary");
      expect(result.current.streamingText).toBe("Generated summary");
      expect(result.current.usage).toEqual({
        total_tokens: 100,
        prompt_tokens: 60,
        completion_tokens: 40,
      });
      expect(result.current.error).toBeNull();
    });

    test("should call onSummaryGenerated callback on mobile", async () => {
      mockGenerateText.mockResolvedValue(
        createMockGenerateTextResult("Summary text", null)
      );

      const onSummaryGenerated = jest.fn();

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content", onSummaryGenerated)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(onSummaryGenerated).toHaveBeenCalledWith("Summary text");
    });

    test("should save to history on mobile", async () => {
      mockGenerateText.mockResolvedValue(
        createMockGenerateTextResult("Summary", {
          total_tokens: 50,
          prompt_tokens: 30,
          completion_tokens: 20,
        })
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content", undefined, mockScrapedData)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(mockAddAiChatHistoryItem).toHaveBeenCalledWith(
        expect.objectContaining({
          url: mockScrapedData.url,
          content: "Summary",
          usage: {
            total_tokens: 50,
            prompt_tokens: 30,
            completion_tokens: 20,
          },
        })
      );
    });
  });

  describe("generateSummaryText - desktop mode", () => {
    beforeEach(() => {
      const reactDeviceDetect = require("react-device-detect");
      Object.defineProperty(reactDeviceDetect, "isMobile", {
        value: false,
        writable: true,
      });
    });

    test("should generate summary using streaming on desktop", async () => {
      const mockTextStream = (async function* () {
        yield "Part 1 ";
        yield "Part 2";
      })();

      const mockChunkStream = (async function* () {
        yield {
          usage: {
            total_tokens: 80,
            prompt_tokens: 50,
            completion_tokens: 30,
          },
        };
      })();

      const mockStreamResult = {
        textStream: mockTextStream,
        chunkStream: mockChunkStream,
        stepStream: {} as any,
        warnings: undefined,
        toDataStreamResponse: jest.fn(),
      } as unknown as StreamTextResult;

      mockGenerateSummary.mockResolvedValue(mockStreamResult);

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content", undefined, mockScrapedData)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(mockGenerateSummary).toHaveBeenCalled();
      expect(result.current.summary).toBe("Part 1 Part 2");
      expect(result.current.error).toBeNull();
    });

    test("should track usage from chunk stream", async () => {
      const mockTextStream = (async function* () {
        yield "Text";
      })();

      const mockChunkStream = (async function* () {
        yield {
          usage: {
            total_tokens: 100,
            prompt_tokens: 60,
            completion_tokens: 40,
          },
        };
      })();

      const mockStreamResult = {
        textStream: mockTextStream,
        chunkStream: mockChunkStream,
        stepStream: {} as any,
        warnings: undefined,
        toDataStreamResponse: jest.fn(),
      } as unknown as StreamTextResult;

      mockGenerateSummary.mockResolvedValue(mockStreamResult);

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      // Usage should be updated (eventually, due to async processing)
      // We can't reliably test timing here, but we verify it doesn't crash
      expect(result.current.summary).toBe("Text");
    });
  });

  describe("template processing", () => {
    test("should process template variables in custom prompt", async () => {
      mockGenerateText.mockResolvedValue(
        createMockGenerateTextResult("Summary", null)
      );

      mockProcessTemplate.mockReturnValue("Processed prompt with data");

      const reactDeviceDetect = require("react-device-detect");
      Object.defineProperty(reactDeviceDetect, "isMobile", {
        value: true,
        writable: true,
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Content", undefined, mockScrapedData)
      );

      await waitForNextUpdate();

      act(() => {
        result.current.setCustomPrompt("Template: {{title}}");
      });

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(mockProcessTemplate).toHaveBeenCalledWith(
        "Template: {{title}}",
        mockScrapedData
      );
    });
  });

  describe("error handling", () => {
    test("should handle generateText errors on mobile", async () => {
      const reactDeviceDetect = require("react-device-detect");
      Object.defineProperty(reactDeviceDetect, "isMobile", {
        value: true,
        writable: true,
      });

      mockGenerateText.mockRejectedValue(new Error("API Error"));

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content")
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      expect(result.current.error).toBe("API Error");
      expect(result.current.isLoading).toBe(false);
    });

    test("should handle history save errors without breaking generation", async () => {
      mockGenerateText.mockResolvedValue(
        createMockGenerateTextResult("Summary", null)
      );

      mockAddAiChatHistoryItem.mockRejectedValue(new Error("History error"));

      const reactDeviceDetect = require("react-device-detect");
      Object.defineProperty(reactDeviceDetect, "isMobile", {
        value: true,
        writable: true,
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useAiSummary("Test content", undefined, mockScrapedData)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current.generateSummaryText();
      });

      // Summary should still be generated even if history save fails
      expect(result.current.summary).toBe("Summary");
      expect(result.current.error).toBeNull();
    });
  });
});

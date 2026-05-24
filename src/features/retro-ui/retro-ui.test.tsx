import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

async function loadRetroUi() {
  const modulePath = "./index";

  try {
    return await import(modulePath);
  } catch {
    return {} as Record<string, unknown>;
  }
}

describe("retro-ui public API", () => {
  it("exports the foundational retro UI components", async () => {
    const retroUi = await loadRetroUi();

    expect(retroUi.StartupScreen).toEqual(expect.any(Function));
    expect(retroUi.WindowFrame).toEqual(expect.any(Function));
    expect(retroUi.Panel).toEqual(expect.any(Function));
    expect(retroUi.Button).toEqual(expect.any(Function));
    expect(retroUi.MultiSelectOptionGroup).toEqual(expect.any(Function));
    expect(retroUi.Dialog).toEqual(expect.any(Function));
    expect(retroUi.StatusLabel).toEqual(expect.any(Function));
    expect(retroUi.SourceReference).toEqual(expect.any(Function));
  });
});

describe("StartupScreen", () => {
  it("uses the startup glyph as the action button", async () => {
    const { StartupScreen } = await loadRetroUi();
    const onAction = vi.fn();

    expect(StartupScreen).toEqual(expect.any(Function));
    if (typeof StartupScreen !== "function") return;

    render(
      <StartupScreen
        title="LifeOS"
        status="正在读取个人档案..."
        actionLabel="启动"
        onAction={onAction}
      />,
    );

    expect(screen.getByRole("heading", { name: "LifeOS" })).toBeInTheDocument();
    expect(screen.getByText("正在读取个人档案...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "启动" })).toHaveClass(
      "retro-ui-startup-action",
    );
    expect(screen.getByLabelText("LifeOS startup screen")).toHaveClass(
      "retro-ui-startup-screen",
    );

    await userEvent.click(screen.getByRole("button", { name: "启动" }));

    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe("WindowFrame and Panel", () => {
  it("render titled regions with Macintosh-inspired chrome", async () => {
    const { WindowFrame, Panel, StatusLabel, SourceReference } = await loadRetroUi();

    expect(WindowFrame).toEqual(expect.any(Function));
    expect(Panel).toEqual(expect.any(Function));
    expect(StatusLabel).toEqual(expect.any(Function));
    expect(SourceReference).toEqual(expect.any(Function));
    if (
      typeof WindowFrame !== "function" ||
      typeof Panel !== "function" ||
      typeof StatusLabel !== "function" ||
      typeof SourceReference !== "function"
    ) {
      return;
    }

    const { container } = render(
      <WindowFrame title="个人说明书" statusBar="完成前不会写入本地数据。">
        <Panel title="待验证观察">
          <StatusLabel tone="pending">待验证</StatusLabel>
          <SourceReference
            items={[
              { id: "q1-action", label: "第 1 题：行动力" },
              { id: "q3-deadline", label: "第 3 题：外部截止日期" },
            ]}
          />
        </Panel>
      </WindowFrame>,
    );

    expect(
      screen.getByRole("region", { name: "个人说明书" }),
    ).toHaveClass("retro-ui-window-frame");
    expect(container.querySelectorAll(".retro-ui-title-control")).toHaveLength(3);
    expect(container.querySelector(".retro-ui-mac-face")).toBeInTheDocument();
    expect(container.querySelector(".retro-ui-mac-face-mouth")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "待验证观察" }),
    ).toHaveClass("retro-ui-panel");
    expect(screen.getByText("待验证")).toHaveClass("retro-ui-status-label");
    expect(screen.getByText("第 1 题：行动力")).toBeInTheDocument();
    expect(screen.getByText("第 3 题：外部截止日期")).toBeInTheDocument();
  });
});

describe("Button", () => {
  it("renders a square retro button that forwards click events", async () => {
    const { Button } = await loadRetroUi();
    const onClick = vi.fn();

    expect(Button).toEqual(expect.any(Function));
    if (typeof Button !== "function") return;

    render(<Button onClick={onClick}>确认写入</Button>);
    const button = screen.getByRole("button", { name: "确认写入" });

    await userEvent.click(button);

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("retro-ui-button");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("MultiSelectOptionGroup", () => {
  it("selects options through props and refuses selections beyond max", async () => {
    const { MultiSelectOptionGroup } = await loadRetroUi();
    const onChange = vi.fn();

    expect(MultiSelectOptionGroup).toEqual(expect.any(Function));
    if (typeof MultiSelectOptionGroup !== "function") return;

    render(
      <MultiSelectOptionGroup
        label="恢复方式"
        min={1}
        max={2}
        value={["alone", "walk"]}
        onChange={onChange}
        options={[
          { id: "alone", label: "独处" },
          { id: "walk", label: "散步" },
          { id: "music", label: "听音乐" },
        ]}
      />,
    );

    expect(screen.getByRole("group", { name: "恢复方式" })).toHaveClass(
      "retro-ui-multi-select",
    );
    expect(screen.getByRole("button", { name: "独处" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "听音乐" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "听音乐" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not deselect when doing so would go below min", async () => {
    const { MultiSelectOptionGroup } = await loadRetroUi();
    const onChange = vi.fn();

    expect(MultiSelectOptionGroup).toEqual(expect.any(Function));
    if (typeof MultiSelectOptionGroup !== "function") return;

    render(
      <MultiSelectOptionGroup
        label="行动节奏"
        min={1}
        max={3}
        value={["sprint"]}
        onChange={onChange}
        options={[
          { id: "sprint", label: "短时间冲刺" },
          { id: "steady", label: "稳定日更" },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "短时间冲刺" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "短时间冲刺" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds and removes selections within min and max", async () => {
    const { MultiSelectOptionGroup } = await loadRetroUi();
    const onChange = vi.fn();

    expect(MultiSelectOptionGroup).toEqual(expect.any(Function));
    if (typeof MultiSelectOptionGroup !== "function") return;

    const { rerender } = render(
      <MultiSelectOptionGroup
        label="沟通偏好"
        min={1}
        max={3}
        value={["direct"]}
        onChange={onChange}
        options={[
          { id: "direct", label: "直接说重点" },
          { id: "written", label: "用文字说清楚" },
          { id: "choices", label: "给出明确选择" },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "用文字说清楚" }));
    expect(onChange).toHaveBeenLastCalledWith(["direct", "written"]);

    rerender(
      <MultiSelectOptionGroup
        label="沟通偏好"
        min={1}
        max={3}
        value={["direct", "written"]}
        onChange={onChange}
        options={[
          { id: "direct", label: "直接说重点" },
          { id: "written", label: "用文字说清楚" },
          { id: "choices", label: "给出明确选择" },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "直接说重点" }));
    expect(onChange).toHaveBeenLastCalledWith(["written"]);
  });
});

describe("Dialog", () => {
  it("renders a reset-confirmation dialog and wires cancel and confirm actions", async () => {
    const { Dialog } = await loadRetroUi();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    expect(Dialog).toEqual(expect.any(Function));
    if (typeof Dialog !== "function") return;

    render(
      <Dialog
        open
        title="重置 LifeOS？"
        confirmLabel="确认重置"
        cancelLabel="取消"
        confirmVariant="danger"
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        这会清空本地数据。
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "重置 LifeOS？" })).toHaveClass(
      "retro-ui-dialog",
    );
    expect(screen.getByRole("heading", { name: "重置 LifeOS？" })).toHaveClass(
      "retro-ui-dialog-title",
    );
    expect(screen.getByText("这会清空本地数据。")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "取消" }));
    await userEvent.click(screen.getByRole("button", { name: "确认重置" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when closed", async () => {
    const { Dialog } = await loadRetroUi();

    expect(Dialog).toEqual(expect.any(Function));
    if (typeof Dialog !== "function") return;

    render(
      <Dialog
        open={false}
        title="重置 LifeOS？"
        confirmLabel="确认重置"
        cancelLabel="取消"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      >
        这会清空本地数据。
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

import { AvailableLanguages } from "#/i18n";
import { I18nKey } from "#/i18n/declaration";
import {
  fetchAgents,
  fetchModels,
  getCurrentSettings,
  saveSettings,
} from "#/services/settingsService";
import { Spinner } from "@nextui-org/react";
import React from "react";
import { useTranslation } from "react-i18next";
import BaseModal from "../base-modal/BaseModal";
import SettingsForm from "./SettingsForm";

interface SettingsProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function SettingsModal({ isOpen, onOpenChange }: SettingsProps) {
  const { t } = useTranslation();
  const currentSettings = React.useMemo(() => getCurrentSettings(), []);

  const [models, setModels] = React.useState<string[]>([]);
  const [agents, setAgents] = React.useState<string[]>([]);
  const [settings, setSettings] =
    React.useState<Partial<Settings>>(currentSettings);
  const [apiKey, setApiKey] = React.useState<string>(
    localStorage.getItem(`API_KEY_${settings.LLM_MODEL}`) || "",
  );

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setModels(await fetchModels());
        setAgents(await fetchAgents());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleModelChange = (model: string) => {
    setSettings((prev) => ({ ...prev, LLM_MODEL: model }));
  };

  const handleAgentChange = (agent: string) => {
    setSettings((prev) => ({ ...prev, AGENT: agent }));
  };

  const handleLanguageChange = (language: string) => {
    const key = AvailableLanguages.find(
      (lang) => lang.label === language,
    )?.value;

    if (key) setSettings((prev) => ({ ...prev, LANGUAGE: key }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t(I18nKey.CONFIGURATION$MODAL_TITLE)}
      subtitle={t(I18nKey.CONFIGURATION$MODAL_SUB_TITLE)}
      actions={[
        {
          label: t(I18nKey.CONFIGURATION$MODAL_SAVE_BUTTON_LABEL),
          action: () => {
            setSettings((prev) => ({ ...prev, LLM_API_KEY: apiKey }));
            saveSettings(settings);
          },
          closeAfterAction: true,
          className: "bg-primary rounded-small",
        },
        {
          label: t(I18nKey.CONFIGURATION$MODAL_CLOSE_BUTTON_LABEL),
          action: () => {
            setSettings(currentSettings); // reset settings from any changes
          },
          closeAfterAction: true,
          className: "bg-neutral-500 rounded-small",
        },
      ]}
    >
      {loading && <Spinner />}
      {!loading && (
        <SettingsForm
          settings={settings}
          models={models}
          apiKey={apiKey}
          agents={agents}
          onModelChange={handleModelChange}
          onAgentChange={handleAgentChange}
          onLanguageChange={handleLanguageChange}
          onAPIKeyChange={(key) => setApiKey(key)}
        />
      )}
    </BaseModal>
  );
}

export default SettingsModal;

from django.urls import path
from .views import (
    OracleSignatureView,
    VerifyArtworkView,
    RecordMintView,
    ContractInfoView
)

urlpatterns = [
    path('oracle-signature/', OracleSignatureView.as_view(), name='security-oracle-signature'),
    path('verify/', VerifyArtworkView.as_view(), name='security-verify'),
    path('record-mint/', RecordMintView.as_view(), name='security-record-mint'),
    path('contract/', ContractInfoView.as_view(), name='security-contract-info'),
]

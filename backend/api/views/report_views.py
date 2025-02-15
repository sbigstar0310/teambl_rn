from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.models import Report
from api.serializers import ReportSerializer


class ReportCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    queryset = Report.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # 현재 로그인한 유저를 신고자로 설정
